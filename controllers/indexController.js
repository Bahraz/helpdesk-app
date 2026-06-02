const { validationResult } = require("express-validator");
const Role = require("../models/Role");
const Department = require("../models/Department");
const User = require("../models/User");
const {
  renderUserCreateForm,
  renderUserEditForm
} = require("../helpers/view.helper");
const userService = require("../services/user.service");
const mergeUserFormData = require("../helpers/data.helper").mergeUserFormData;

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
    const editedUser = await userService.findById(req.params.id);

    await renderUserEditForm(req, res, 200, {
      editedUser,
      error: null,
    });
  }
  catch (error) {
    if (error.status === 404) {
      return res.status(404).render("index", {
        user: req.session.user,
        page: "partials/error",
        message: "Nie znaleziono użytkownika.",
      });
    }
    console.error("Błąd pobierania danych do edycji użytkownika:", error);

    res.status(500).render("index", {
      user: req.session.user,
      page: "partials/error",
      message: "Nie udało się pobrać danych użytkownika.",
    });
  }
};

exports.getUserResetPassword = async (req, res) => {
  try {
    const editedUser = await userService.findById(req.params.id);
    const result = await userService.resetPassword(req.params.id);

    return res.render("index", {
      user: req.session.user,
      page: "pages/admin/user-reset-password",
      editedUser: result,
      temporaryPassword: result.temporaryPassword,
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).render("index", {
        user: req.session.user,
        page: "partials/error",
        message: "Nie znaleziono użytkownika.",
      });
    }

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
  try {
    const createdUser = await userService.createUserByAdmin(req.body);

    return res.render("index", {
      user: req.session.user,
      page: "pages/admin/user-create-success",
      createdUser,
    });
  } catch (error) {
    console.error("Błąd tworzenia użytkownika:", error);

    return await renderUserCreateForm(res, res, 500, {
      formData: req.body,
      error: error.message || "Nie udało się utworzyć użytkownika.",
    });
  }
};

exports.postUserEdit = async (req, res) => {
  try {
    const userId = req.params.id;
    await userService.updateUserByAdmin(userId, req.body);

    return res.redirect("/users");

  } catch (error) {
    console.error(error.message);

    return await renderUserEditForm(req, res, error.status || 500, {
      error: error.message || "Nie udało się edytować użytkownika.",
      page: error.status === 409 ? "pages/admin/user-edit" : "partials/error",
      editedUser: error.data || null,
      message: error.message || "Nie udało się pobrać danych do formularza edycji użytkownika.",
    });
  }
};

exports.postUserResetPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await userService.resetPassword(req.params.id);

    return await renderUserEditForm(req, res, 200, {
      editedUser: result,
      page: "pages/admin/user-reset-password",
      temporaryPassword: result.temporaryPassword,
    });

  } catch (error) {
    if (error.status === 404) {
      return res.status(404).render("index", {
        user: req.session.user,
        page: "partials/error",
        message: "Nie znaleziono użytkownika.",
      });
    }

    console.error("Błąd resetowania hasła:", error);

    return res.status(500).render("index", {
      user: req.session.user,
      page: "partials/error",
      message: "Nie udało się zresetować hasła użytkownika.",
    });
  }
}

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