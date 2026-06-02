const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/User");

function mapUserRole(roleName) {
  if (!roleName) {
    return null;
  }

  const normalizedRole = roleName.toLowerCase();

  if (normalizedRole === "admin") {
    return "admin";
  }

  if (normalizedRole === "requestor") {
    return "requestor";
  }

  if (normalizedRole === "agent") {
    return "agent";
  }

  return null;
}

async function login(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      title: "Logowanie",
      errors: errors.array(),
      old: {
        email: req.body.email,
      },
    });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).render("auth/login", {
        title: "Logowanie",
        errors: [{ msg: "Nieprawidłowy email lub hasło." }],
        old: { email },
      });
    }

    if (!user.is_active) {
      return res.status(403).render("auth/login", {
        title: "Logowanie",
        errors: [{ msg: "Konto jest nieaktywne." }],
        old: { email },
      });
    }

    const passwordIsValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordIsValid) {
      return res.status(401).render("auth/login", {
        title: "Logowanie",
        errors: [{ msg: "Nieprawidłowy email lub hasło." }], // celowo bez konkretnego powodu
        old: { email },
      });
    }

    await User.updateLastLogin(user.id);

    req.session.user = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      roleId: user.role_id,
      roleName: user.role_name,
      departmentId: user.department_id,
    };

    return res.redirect("/dashboard");
  } catch (error) {
    console.error("Błąd logowania:", error);

    return res.status(500).render("auth/login", {
      title: "Logowanie",
      errors: [{ msg: "Wystąpił błąd serwera. Spróbuj ponownie później." }],
      old: { email },
    });
  }
}

function logout(req, res) {
  req.session.destroy((error) => {
    if (error) {
      console.error("Błąd wylogowania:", error);
      return res.redirect("/dashboard");
    }

    res.clearCookie("connect.sid");
    return res.redirect("/login");
  });
}

exports.postLogin = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("index", {
      page: "auth/login",
      error: errors.array()[0].msg,
    });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).render("index", {
        page: "auth/login",
        error: "Nieprawidłowy email lub hasło.",
      });
    }

    if (!user.is_active) {
      return res.status(403).render("index", {
        page: "auth/login",
        error: "Konto jest nieaktywne.",
      });
    }

    const passwordIsValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordIsValid) {
      return res.status(401).render("index", {
        page: "auth/login",
        error: "Nieprawidłowy email lub hasło.",
      });
    }

    await User.updateLastLogin(user.id);

    req.session.user = {
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,

      roleId: user.role_id,
      roleName: user.role_name,
      role: mapUserRole(user.role_name),

      departmentId: user.department_id,
      departmentName: user.department_name,
    };

    return res.redirect("/");
  } catch (error) {
    console.error("Błąd logowania:", error);

    return res.status(500).render("index", {
      page: "auth/login",
      error: "Wystąpił błąd serwera. Spróbuj ponownie później.",
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
