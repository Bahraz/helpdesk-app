const { validationResult } = require("express-validator");
const Role = require("../models/Role");
const Department = require("../models/Department");
const User = require("../models/User");

function generateTemporaryPassword(length = 12) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
}

function getLoggedUser(req) {
  return req.session.user || null;
}

exports.getHome = (req, res) => {
  res.render("index", {
    user: getLoggedUser(req),
  });
};

exports.getLogin = (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }

  res.render("index", {
    user: null,
    page: "auth/login",
    error: null,
  });
};

exports.getLogout = (req, res) => {
  res.render("index", { page: "auth/logout-success" });
};

exports.getRegister = (req, res) => {
  res.render("index", {
    user: getLoggedUser(req),
    page: "auth/register",
    error: null,
  });
};

exports.getTicketsPending = (req, res) => {
  res.render("index", {
    user: getLoggedUser(req),
    page: "pages/admin/tickets-pending",
  });
};

exports.getTicketsActive = (req, res) => {
  res.render("index", {
    user: getLoggedUser(req),
    page: "pages/admin/tickets-active",
  });
};

exports.getTicketsClosed = (req, res) => {
  res.render("index", {
    user: getLoggedUser(req),
    page: "pages/admin/tickets-closed",
  });
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAllWithDetails();

    return res.render("index", {
      user: req.session.user,
      page: "pages/admin/users",
      users: users,
    });
  } catch (error) {
    console.error("Błąd pobierania użytkowników:", error);

    return res.status(500).render("index", {
      user: req.session.user,
      page: "partials/error",
      message: "Nie udało się pobrać listy użytkowników.",
    });
  }
};

exports.getUserCreate = async (req, res) => {
  try {
    const roles = await Role.findAllActive();
    const departments = await Department.findAllActive();

    res.render("index", {
      user: req.session.user,
      page: "pages/admin/user-create",
      roles,
      departments,
      formData: {},
      error: null,
    });
  } catch (error) {
    console.error("Błąd pobierania danych do formularza użytkownika:", error);

    res.status(500).render("index", {
      user: req.session.user,
      page: "partials/error",
      message: "Nie udało się pobrać danych do formularza użytkownika.",
    });
  }
};

exports.getUserEdit = async (req, res) => {
  try {
    const editedUser = await User.findByIdWithDetails(req.params.id);

    if (!editedUser) {
      return res.status(404).render("index", {
        user: req.session.user,
        page: "partials/error",
        message: "Nie znaleziono użytkownika.",
      });
    }

    const roles = await Role.findAllActive();
    const departments = await Department.findAllActive();

    res.render("index", {
      user: req.session.user,
      page: "pages/admin/user-edit",
      editedUser,
      roles,
      departments,
      error: null,
    });
  }
  catch (error) {
    console.error("Błąd pobierania danych do edycji użytkownika:", error);

    res.status(500).render("index", {
      user: req.session.user,
      page: "partials/error",
      message: "Nie udało się pobrać danych użytkownika.",
    });
  }
};

exports.getUserResetPassword = async (req, res) => {
  const userId = req.params.id;

  try {
    const editedUser = await User.findByIdWithDetails(userId);

    if (!editedUser) {
      return res.status(404).render("index", {
        user: req.session.user,
        page: "partials/error",
        message: "Nie znaleziono użytkownika.",
      });
    }

    const temporaryPassword = generateTemporaryPassword(12);

    await User.resetPassword(userId, temporaryPassword);

    return res.render("index", {
      user: req.session.user,
      page: "pages/admin/user-reset-password",
      editedUser,
      temporaryPassword,
    });
  } catch (error) {
    console.error("Błąd resetowania hasła:", error);

    return res.status(500).render("index", {
      user: req.session.user,
      page: "partials/error",
      message: "Nie udało się zresetować hasła użytkownika.",
    });
  }
};

exports.getTicketDetail = (req, res) => {
  res.render("index", {
    user: getLoggedUser(req),
    page: "pages/admin/ticket-detail",
  });
};

exports.postUserCreate = async (req, res) => {
  console.log("BODY:", req.body);
  const errors = validationResult(req);

  const {
    firstName,
    lastName,
    email,
    phone,
    roleId,
    departmentId,
  } = req.body;

  const formData = {
    firstName,
    lastName,
    email,
    phone,
    roleId,
    departmentId,
  };

  try {
    const roles = await Role.findAllActive();
    const departments = await Department.findAllActive();

    if (!errors.isEmpty()) {
      return res.status(422).render("index", {
        user: req.session.user,
        page: "pages/admin/user-create",
        roles,
        departments,
        formData,
        error: errors.array()[0].msg,
      });
    }

    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      return res.status(409).render("index", {
        user: req.session.user,
        page: "pages/admin/user-create",
        roles,
        departments,
        formData,
        error: "Użytkownik z takim adresem e-mail już istnieje.",
      });
    }

    const temporaryPassword = generateTemporaryPassword(12);

    await User.createByAdmin({
      firstName,
      lastName,
      email,
      phone,
      roleId,
      departmentId,
      password: temporaryPassword,
    });

    return res.render("index", {
      user: req.session.user,
      page: "pages/admin/user-create-success",
      createdUser: {
        firstName,
        lastName,
        email,
        temporaryPassword,
      },
    });
  } catch (error) {
    console.error("Błąd tworzenia użytkownika:", error);

    try {
      const roles = await Role.findAllActive();
      const departments = await Department.findAllActive();

      return res.status(500).render("index", {
        user: req.session.user,
        page: "pages/admin/user-create",
        roles,
        departments,
        formData,
        error: "Nie udało się utworzyć użytkownika.",
      });
    }
    catch {
      return res.status(500).render("index", {
        user: req.session.user,
        page: "partials/error",
        message: "Nie udało się utworzyć użytkownika.",
      });
    }
  }
};

exports.postUserEdit = async (req, res) => {
  const errors = validationResult(req);
  const userId = req.params.id;

  const {
    firstName,
    lastName,
    email,
    phone,
    roleId,
    departmentId,
    isActive,
  } = req.body;

  try {
    const roles = await Role.findAllActive();
    const departments = await Department.findAllActive();

    const editedUser = await User.findByIdWithDetails(userId);

    if (!editedUser) {
      return res.status(404).render("index", {
        user: req.session.user,
        page: "partials/error",
        message: "Nie znaleziono użytkownika.",
      });
    }

    if (!errors.isEmpty()) {
      return res.status(422).render("index", {
        user: req.session.user,
        page: "pages/admin/user-edit",
        editedUser: {
          ...editedUser,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          role_id: roleId,
          department_id: departmentId,
          is_active: isActive,
        },
        roles,
        departments,
        error: errors.array()[0].msg,
      });
    }

    const existingUser = await User.findByEmail(email);

    if (existingUser && Number(existingUser.id) !== Number(userId)) {
      return res.status(409).render("index", {
        user: req.session.user,
        page: "pages/admin/user-edit",
        editedUser: {
          ...editedUser,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          role_id: roleId,
          department_id: departmentId,
          is_active: isActive,
        },
        roles,
        departments,
        error: "Inny użytkownik ma już taki adres e-mail.",
      });
    }

    await User.updateByAdmin(userId, {
      firstName,
      lastName,
      email,
      phone,
      roleId,
      departmentId,
      isActive,
    });

    return res.redirect("/users");
  }
  catch (error) {
    console.error("Błąd edycji użytkownika:", error);

    return res.status(500).render("index", {
      user: req.session.user,
      page: "partials/error",
      message: "Nie udało się zapisać zmian użytkownika.",
    });
  }
};

exports.postUserResetPassword = async (req, res) => {
  const userId = req.params.id;

  try {
    const editedUser = await User.findByIdWithDetails(userId);

    if (!editedUser) {
      return res.status(404).render("index", {
        user: req.session.user,
        page: "partials/error",
        message: "Nie znaleziono użytkownika.",
      });
    }

    const temporaryPassword = generateTemporaryPassword(12);

    await User.resetPassword(userId, temporaryPassword);

    return res.render("index", {
      user: req.session.user,
      page: "pages/admin/user-reset-password",
      editedUser,
      temporaryPassword,
    });
  }
  catch (error) {
    console.error("Błąd resetowania hasła:", error);

    return res.status(500).render("index", {
      user: req.session.user,
      page: "partials/error",
      message: "Nie udało się zresetować hasła użytkownika.",
    });
  }
};

exports.postTicketReply = (req, res) => {
  const action = req.body.action;

  if (action === "close") {
    return res.render("index", {
      user: getLoggedUser(req),
      page: "pages/admin/ticket-close-success",
    });
  }

  res.redirect("/tickets/detail");
};

/*
// Ogarnąłem to do szybkiego testowaia widoków
// Ustawiamy testowego admina. Jeśli chcesz testować widok gościa, przekaż poniżej `null` albo po prostu `res.render("index")`
const mockAdmin = { role: "admin", name: "Admin IT" };

exports.getHome = (req, res) => {
  // res.render("index"); // 1. Widok dla gościa
  // res.render("index", { user: { role: "user", name: "Jan Kowalski" } }); // 2. Widok dla usera
  // res.render("index", { user: { role: "admin", name: "Admin IT" } }); // 3. Widok dla admina

  res.render("index", { user: mockAdmin }); // Ładuje po wejściu domyślnie dashboard admina
};

exports.getTicketsPending = (req, res) =>
  res.render("index", { user: mockAdmin, page: "pages/admin/tickets-pending" });
exports.getTicketsActive = (req, res) =>
  res.render("index", { user: mockAdmin, page: "pages/admin/tickets-active" });
exports.getTicketsClosed = (req, res) =>
  res.render("index", { user: mockAdmin, page: "pages/admin/tickets-closed" });
exports.getUsers = (req, res) =>
  res.render("index", { user: mockAdmin, page: "pages/admin/users" });
exports.getUserCreate = (req, res) =>
  res.render("index", { user: mockAdmin, page: "pages/admin/user-create" });
exports.getTicketDetail = (req, res) =>
  res.render("index", { user: mockAdmin, page: "pages/admin/ticket-detail" });
exports.getUserEdit = (req, res) =>
  res.render("index", { user: mockAdmin, page: "pages/admin/user-edit" });
exports.getUserResetPassword = (req, res) =>
  res.render("index", {
    user: mockAdmin,
    page: "pages/admin/user-reset-password",
  });
exports.postUserCreate = (req, res) =>
  res.render("index", {
    user: mockAdmin,
    page: "pages/admin/user-create-success",
  });
exports.postUserEdit = (req, res) => res.redirect("/users");

exports.postTicketReply = (req, res) => {
  const action = req.body.action;

  if (action === "close") {
    res.render("index", {
      user: mockAdmin,
      page: "pages/admin/ticket-close-success",
    });
  } else {
    res.redirect("/tickets/detail");
  }
};

exports.getLogin = (req, res) => {
  res.render("index", { page: "auth/login", error: null });
};

exports.getLogout = (req, res) => {
  res.render("index", { page: "auth/logout-success" });
};

exports.getRegister = (req, res) => {
  res.render("index", { page: "auth/register", error: null });
};
*/