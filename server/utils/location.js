const axios = require("axios");
const HttpError = require("../models/http-error");
const API_KEY = process.env.G_MAP;

async function getCoordsForAddress(address) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );

  const data = response.data;

  if (!data || data.status === "ZERO_RESULTS") {
    throw new HttpError("couldn not find location for the address", 422);
  }

  return data.results[0].geometry.location;
}

module.exports = getCoordsForAddress;
