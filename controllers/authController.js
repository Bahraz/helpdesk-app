const { validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getRegister = (req, res) => {
  res.render("auth/register", { error: null });
};

exports.postRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("auth/register", { error: errors.array()[0].msg });
  }

  try {
    await User.create(req.body);
    res.redirect("/auth/login");
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.render("auth/register", {
        error: "Konto z tym adresem e-mail już istnieje.",
      });
    }
    res.render("auth/register", {
      error: "Wystąpił błąd podczas rejestracji.",
    });
  }
};

exports.getLogin = (req, res) => {
  res.render("auth/login", { error: null });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.userId = user.id;
      req.session.userName = `${user.first_name} ${user.last_name}`;

      return res.redirect("/tickets");
    }

    res.render("auth/login", { error: "Nieprawidłowy e-mail lub hasło." });
  } catch (error) {
    console.error(error);
    res.render("auth/login", { error: "Błąd logowania." });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
};
