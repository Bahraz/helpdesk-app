const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");

const router = express.Router();

router.post(
  "/login",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email jest wymagany.")
      .isEmail()
      .withMessage("Podaj poprawny adres email.")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Hasło jest wymagane.")
      .isLength({ min: 6 })
      .withMessage("Hasło jest wymagane.")
  ],
  authController.postLogin
);

router.get("/logout", authController.logout);

module.exports = router;
