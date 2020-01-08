const uuid = require("uuid/v4");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwt_key = process.env.JWT_KEY;

const getUsers = async (req, res, next) => {
  res.status(200);
  let listOfUsers;
  try {
    listOfUsers = await User.find({}, "-password");
  } catch (error) {
    return next(new HttpError("can not get all users", 401));
  }
  res.json(listOfUsers.map(user => user.toObject({ getters: true })));
};

const createUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Please validate your data", 401));
  }
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Signing up failed please try again.", 500);
    return next(err);
  }

  if (existingUser) {
    const err = new HttpError("User exists already please login.", 500);
    return next(err);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    const err = new HttpError("Could not create the user", 500);
    return next(err);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: []
  });

  try {
    await createdUser.save();
  } catch (error) {
    const err = new HttpError("Signing up failed, please try again.", 500);
    return next(err);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      jwt_key,
      { expiresIn: "1h" }
    );
  } catch (error) {
    const err = new HttpError("Signing up failed, please try again.", 500);
    return next(err);
  }
  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError("Can not find the user", 401));
  }

  if (!user) {
    return next(new HttpError("Can not find the user", 401));
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (error) {
    return next(new HttpError("Invalid username or password", 401));
  }

  if (!isValidPassword) {
    return next(new HttpError("Invalid username or password", 401));
  }

  let token;
  try {
    token = jwt.sign({ userId: user.id, email: user.email }, jwt_key, {
      expiresIn: "1h"
    });
  } catch (error) {
    const err = new HttpError("login failed, please try again.", 500);
    return next(err);
  }

  //res.status(201).json({ loggedIn: true });
  res.status(201).json({ userId: user.id, email: user.email, token: token });
};

exports.getUsers = getUsers;
exports.createUser = createUser;
exports.loginUser = loginUser;
