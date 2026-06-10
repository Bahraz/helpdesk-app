const express = require("express");
const indexController = require("../controllers/indexController");
const userController = require("../controllers/user.controller");
const authController = require("../controllers/authController");
const { requireAuth, requireGuest, requireRole } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, requireRole("admin"), userController.getUsers);

router.get("/new", requireAuth, requireRole("admin"), userController.getUserCreate);
router.get("/profile", requireAuth, userController.getUserProfile);
router.get("/edit/:id", requireAuth, requireRole("admin"), userController.getUserEdit);
router.get("/reset-password/:id", requireAuth, requireRole("admin"), userController.getUserResetPassword);

router.post("/new", requireAuth, requireRole("admin"), userController.postUserCreate);
router.post("/edit/:id", requireAuth, requireRole("admin"), userController.postUserEdit);
router.post("/reset-password/:id", requireAuth, requireRole("admin"), userController.postUserResetPassword);

router.post("/profile", requireAuth, userController.putUserProfile);

module.exports = router;