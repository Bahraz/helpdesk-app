const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const authService = require("../services/auth.service");
const { mapSessionUser } = require("../helpers/data.helper");

exports.postLogin = async (req, res) => {
  try {
    const user = await authService.login(req.body);

    req.session.user = mapSessionUser(user);

    return res.redirect("/");
  } catch (error) {
    console.error("Błąd logowania:", error);

    return res.status(error.status || 500).render("index", {
      page: "auth/login",
      error: error.message || "Wystąpił błąd serwera. Spróbuj ponownie później.",
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Błąd wylogowania:", error);
      return res.redirect("/");
    }

    res.clearCookie("connect.sid");

    return res.render("index", {
      page: "auth/logout-success",
    });
  });
};
