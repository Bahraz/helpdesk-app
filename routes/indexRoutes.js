const express = require("express");
const indexController = require("../controllers/indexController");
const router = express.Router();

router.get("/", indexController.getHome);
router.get("/auth/login", indexController.getLogin);
router.get("/auth/register", indexController.getRegister);
router.get("/logout", indexController.getLogout);

router.get("/tickets/pending", indexController.getTicketsPending);
router.get("/tickets/active", indexController.getTicketsActive);
router.get("/tickets/closed", indexController.getTicketsClosed);
router.get("/tickets/detail", indexController.getTicketDetail);
router.get("/profile", indexController.getProfile);
router.get("/admin/users/new", indexController.getUserCreate);
router.get("/admin/users/edit", indexController.getUserEdit);
router.get("/admin/users/reset-password", indexController.getUserResetPassword);
router.post("/admin/users/new", indexController.postUserCreate);
router.post("/admin/users/edit", indexController.postUserEdit);
router.post("/tickets/:id/reply", indexController.postTicketReply);

module.exports = router;
