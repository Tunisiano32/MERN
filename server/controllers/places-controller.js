const HttpError = require("../models/http-error");
const fs = require("fs");
const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");
const Place = require("../models/place");
const User = require("../models/user");
const getCoordsForAddress = require("../utils/location");
const mongoose = require("mongoose");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError("can not find it", 500));
  }
  if (!place) {
    return next(HttpError(`could not find a place for id ${placeId}`, 404));
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (error) {
    return next(new HttpError("can not find it", 500));
  }
  if (!places.length) {
    throw new HttpError("could not find a place by the user", 404);
  }
  res.json({ places: places.map(x => x.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("invalid input passed check your data", 422));
  }

  const { title, description, address } = req.body;
  const creator = req.userData.userId;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("Creating the place failed", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("The creator is invalid", 500);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    console.log({ error });
    return next(new HttpError("Creating place failed", 500));
  }
  res.status(201).json({ createdPlace });
};

const updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("invalid input passed check your data", 422));
  }
  const placeId = req.params.pid;
  const { title, description } = req.body;
  try {
    const selectedPlace = await Place.findById(placeId);
    if (selectedPlace.creator.toString() !== req.userData.userId) {
      return next(new HttpError("you are not allowed to edit this place", 401));
    }
    selectedPlace.title = title;
    selectedPlace.description = description;

    await selectedPlace.save();
    res.status(201).json({ place: selectedPlace.toObject({ getters: true }) });
  } catch (error) {
    console.log(error);
    return next(
      new HttpError(`failed to update place with placeid: ${placeId}`, 404)
    );
  }
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
    if (place.creator.id !== req.userData.userId) {
      throw new HttpError("You are not authorized", 401);
    }
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Could not find place for this id.", 404);
    return next(error);
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }
  fs.unlink(imagePath, err => {
    console.log(err);
  });
  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
