const express = require("express");
const router = express.Router();

const { check } = require("express-validator");

const usersController = require("../controllers/users-controller");
const fileUpload = require("../middleware/file-upload");

router.get("/", usersController.getUsers);
router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name")
      .not()
      .isEmpty(),
    check("email")
      .normalizeEmail()
      .isEmail(),
    check("password")
      .not()
      .isEmpty()
  ],
  usersController.createUser
);

router.post("/login", usersController.loginUser);

module.exports = router;
