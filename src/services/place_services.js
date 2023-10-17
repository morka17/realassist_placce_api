const Place = require("../models/place_model");

async function AddAddress(place) {
  try {
    await place.save();
    console.log("Successfully uploaded!");
  } catch (e) {
    console.log("Error " + e);
  }
}

async function findAddresses(query) {
  try {
    let response = await Place.find({ fullAddress: { $regex: query, $options: "i" } });
    return response
  } catch (e) {
    console.log("Error " + e);
    return e;
  }
}

module.exports = {
  AddAddress: AddAddress,
  findAddresses: findAddresses,
};
