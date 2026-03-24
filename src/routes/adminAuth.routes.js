const express = require("express");

const router = express.Router();

const {
  loginAdmin,
  getAdminSession,
} = require("../controllers/adminAuth.controllers.js");
const { requireAdminAuth } = require("../middlewares/adminAuth.js");
const { adminLoginRateLimit } = require("../middlewares/adminLoginRateLimit.js");

router.route("/login").post(adminLoginRateLimit, loginAdmin);
router.route("/session").get(requireAdminAuth, getAdminSession);

module.exports = router;
