const express = require("express");

const router = express.Router();

const {
  submitDownloadForm,
  getAllDownloadForms,
} = require("../controllers/download.controllers.js");
const { requireAdminAuth } = require("../middlewares/adminAuth.js");

router.route("/").post(submitDownloadForm);
router.route("/admin/downloads").get(requireAdminAuth, getAllDownloadForms);

module.exports = router;
