const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    if (req.method === "OPTIONS") {
      return next();
    }
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Authentication failed");
    }
    const decodedToken = await jwt.verify(token, "supersecret_dontshare");
    req.userData = {
      userId: decodedToken.userId
    };
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed");
    return next(error);
  }
};
