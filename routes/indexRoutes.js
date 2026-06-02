const express = require("express");
const indexController = require("../controllers/indexController");
const authController = require("../controllers/authController");
const { requireAuth, requireGuest, requireRole } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", indexController.getHome);

router.get("/auth/login", requireGuest, indexController.getLogin);
router.get("/auth/register", requireAuth, requireRole("admin"), indexController.getRegister);

router.get("/logout", requireAuth, authController.logout);

// Admin
router.get("/tickets/pending", requireAuth, requireRole("admin"), indexController.getTicketsPending);
router.get("/tickets/active", requireAuth, requireRole("admin"), indexController.getTicketsActive);
router.get("/tickets/closed", requireAuth, requireRole("admin"), indexController.getTicketsClosed);

router.get("/users", requireAuth, requireRole("admin"), indexController.getUsers);

router.get("/admin/user/new", requireAuth, requireRole("admin"), indexController.getUserCreate);
router.get("/admin/user/edit/:id", requireAuth, requireRole("admin"), indexController.getUserEdit);
router.get("/admin/users/reset-password/:id", requireAuth, requireRole("admin"), indexController.getUserResetPassword);

router.post("/admin/user/new", requireAuth, requireRole("admin"), indexController.postUserCreate);
router.post("/admin/user/edit/:id", requireAuth, requireRole("admin"), indexController.postUserEdit);
router.post("/admin/users/reset-password/:id", requireAuth, requireRole("admin"), indexController.postUserResetPassword);

// Ticket detail: Admin i Requestor mogą wejść
router.get("/tickets/detail", requireAuth, requireRole("admin", "requestor"), indexController.getTicketDetail);

// Odpowiedź w tickecie: Admin i Requestor mogą odpowiedzieć
router.post("/tickets/:id/reply", requireAuth, requireRole("admin", "requestor"), indexController.postTicketReply);

module.exports = router;
