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
exports.getProfile = (req, res) =>
  res.render("index", { user: mockAdmin, page: "pages/admin/profile" });
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
exports.postUserEdit = (req, res) => res.redirect("/profile");

exports.getLogin = (req, res) => {
  res.render("index", { page: "auth/login", error: null });
};

exports.getRegister = (req, res) => {
  res.render("index", { page: "auth/register", error: null });
};
