const { default: axios } = require("axios");
const express = require("express");
const { connect } = require("mongoose");
// const { default: placeRoutes } = require("./routes/routes");

const port = 3000;

const app = express();

// Body Parser
app.use(express.json());

app.listen(port, async () => {
  // LOGGER INFO
  console.log(`Server is running on port ${port}`);

  // await connect();

  app.get("/", (req, res) => {
    res.sendStatus(200);
  });


//   USING OPENMAP API 
  app.get("/api/places/info/", async (req, res) => {
    const overpassEndpoint = "https://overpass-api.de/api/interpreter";

    const { lat, long } = req.query;
    if (!lat) {
      res.send("Invalid latitude");
    }

    if (!long) {
      res.send("Invalid latitude");
    }


    // const boundingBox =
    //   `min_lat=${MinimumLatitude}&max_lat=${MaximumLatitude}&min_lon=${MinimumLongitude}&max_lon=${MaximumLongitude}`;

    // //   way["highway"](boundingBox);
    // const overpassQuery = `
    //   [out:json];
    //   node(33.5556, -87.0809, 33.0176, -86.1817);
    //   way(33.5556, -87.0809, 33.0176, -86.1817);
    //   relation(33.5556, -87.0809, 33.0176, -86.1817);
    //   out body;
    // `.

    // 33.5556,-87.0809

    // ALABAMA boundingBox COORDINATE (34.999,-88.319,30.223,-84.890);

    const overpassQuery = `
      [out:json];
      (
        way(around:5000,${lat},${long});
      );
      out body;
      >;
      out skel qt;
    `;

    axios
      .get(overpassEndpoint, {
        params: {
          data: overpassQuery,
        },
      })
      .then((response) => {
        // Handle the response data (street lines) here
        console.log(response.data);

        let places = [];

        const data = response.data;
        const elements = data.elements;

        for (element of elements) {
          let placeMap = {};

          // Checking if a property exists
          let data = element.tags;

          //   Street line
          if (data && "name" in data) {
            placeMap["street_line"] = data["name"];
          }

          if (data && "highway" in data) {
            placeMap["highway"] = data["highway"];
          }

          if (data && "tiger:county" in data) {
            let countryInfo = data["tiger:county"];
            let countryInfoList = countryInfo
              .split(",")
              .map((item) => item.trim());
            placeMap["city"] = countryInfoList[0];
            placeMap["state"] = countryInfoList[1];
            placeMap["country"] = countryInfo;
          }

          if (placeMap["street_line"]) {
            placeMap["fullAdress"] =
              placeMap["street_line"] + placeMap["country"];
          } else {
            placeMap["fullAdress"] = placeMap["country"];
          }

          places.push(placeMap);
        }

        res.send(places);
      })
      .catch((error) => {
        // Handle errors
        console.error(error);
      });
  });

  /// Get place by query
  app.get("/api/places/search/", async (req, res) => {
    const { q } = req.query;

    if (!q) {
      res.send();
    }

    try {
      const response = await axios.get(
        `https://api.bhr.fyi/api/address/search/?search=${q}`
      );

      let places = [];

      // Send the API response back to the client
      const results = response.data.data.results;

      for (result of results) {
        let { street_line, city, state, zipcode, displayAddress } = result;
        let placeMap = {
          street_line: street_line,
          city: city,
          state: state,
          zipcode: zipcode,
          fullAaddress: displayAddress,
        };

        places.push(placeMap);
      }

      res.json({
        found: true,
        error: false,
        places: places,
      });
    } catch (error) {
      // Handle errors
      console.error("Error fetching data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
});
