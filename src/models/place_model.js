const mongoose = require("mongoose");

// {
//     "street_line": "123 12th St NE",
//     "secondary": "",
//     "city": "Norton",
//     "state": "VA",
//     "zipcode": "24273",
//     "entries": 0,
//     "source": "postal",
//     "displayAddress": "123 12th St NE, Norton, VA 24273"
//   },

const PlaceSchema = mongoose.Schema;

const placeSchema = new PlaceSchema({
  highway: String,
  street_line: String,
  city: String,
  state: String,
  country: String,
  fullAddress: String,
});

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;
