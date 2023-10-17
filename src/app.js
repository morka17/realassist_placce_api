const { default: axios } = require("axios");
const express = require("express");
const connectDB = require("./utils/connectdb");
const Place = require("./models/place_model");
const { AddAddress, findAddresses } = require("./services/place_services");
// const { default: placeRoutes } = require("./routes/routes");

const port = 3000;

const app = express();

// Body Parser
app.use(express.json());

app.listen(port, async () => {
  // LOGGER INFO
  console.log(`Server is running on port ${port}`);

  connectDB(); // Database Connection

  app.get("/", (req, res) => {
    res.sendStatus(200);
  });

  //   USING OPENMAP Street API
  app.get("/api/places/info/", async (req, res) => {
    const overpassEndpoint = "https://overpass-api.de/api/interpreter";

    const { lat, long } = req.query;
    if (!lat) {
      res.send("Invalid latitude");
    }

    if (!long) {
      res.send("Invalid longitudeW");
    }
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
      .then(async (response) => {
        // Handle the response data (street lines) here
        console.log(response.data);

        let places = [];

        const data = response.data;
        const elements = data.elements;

        for (element of elements) {
          let place = new Place();

          // Checking if a property exists
          let data = element.tags;

          //   Street line
          if (data && "name" in data) {
            place.street_line = data["name"];
          } else {
            continue;
          }

          if (data && "highway" in data) {
            place.highway = data["highway"];
          }

          if (data && "tiger:county" in data) {
            let countryInfo = data["tiger:county"];
            let countryInfoList = countryInfo
              .split(",")
              .map((item) => item.trim());
            place.city = countryInfoList[0];
            place.state = countryInfoList[1];
            place.country = countryInfo;
          }

          if (place["street_line"]) {
            (place.fullAddress = place.street_line), +", " + place.country;
          }

          places.push(place);
        }

        res.json({
          found: places.length > 0 ? true : false,
          error: false,
          totalLength: places.length,
          places: places,
        });
      })
      .catch((error) => {
        // Handle errors
        console.error(error);
      });
  });

  /// Get place by query from DATABASE
  app.get("/api/addresses/search/", async (req, res) => {
    const { q } = req.query;

    let places = await findAddresses(q);
    res.json({
      found: places.length > 0 ? true : false,
      error: false,
      totalLength: places.length,
      places: places,
    });
  });

  /// Get place by query from external API
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
        let { street_line, city, state, zipcode, displayAddress } =
          result;
        const place = new Place({
          street_line: street_line,
          city: city,
          state: state,
          country: "US",
          fullAddress: displayAddress,
        });

        await AddAddress(place);

        places.push(place);
      }

      res.json({
        found: places.length > 0 ? true : false,
        error: false,
        totalLength: places.length,
        places: places,
      });
    } catch (error) {
      // Handle errors
      console.error("Error fetching data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
});
