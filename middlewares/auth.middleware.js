function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect("/auth/login");
  }

  next();
}

function requireGuest(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect("/");
  }

  next();
}

function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.session || !req.session.user) {
      return res.redirect("/auth/login");
    }

    if (!allowedRoles.includes(req.session.user.role)) {
      return res.status(403).render("index", {
        user: req.session.user,
        page: "partials/error",
        message: "Brak dostępu.",
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireGuest,
  requireRole
};