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
router.get("/users", indexController.getUsers);
router.get("/admin/user/new", indexController.getUserCreate);
router.get("/admin/user/edit", indexController.getUserEdit);
router.get("/admin/users/reset-password", indexController.getUserResetPassword);
router.post("/admin/user/new", indexController.postUserCreate);
router.post("/admin/user/edit", indexController.postUserEdit);
router.post("/tickets/:id/reply", indexController.postTicketReply);

module.exports = router;
