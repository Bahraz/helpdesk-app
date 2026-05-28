const { validationResult } = require("express-validator");

// Wywaliłem tu wszystko 

exports.postRegister = async (req, res) => {
  res.send("Endpoint POST /auth/register");
};

exports.postLogin = async (req, res) => {
  res.send("Endpoint POST /auth/login");
};

exports.logout = (req, res) => {
  res.send("Endpoint GET /auth/logout");
};
