const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { requireAuth, requireGuest, requireRole } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/login", requireGuest, authController.getLogin);
router.get("/register", requireAuth, requireRole("admin"), authController.getRegister);

router.get("/logout", requireAuth, authController.logout);

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


module.exports = router;
