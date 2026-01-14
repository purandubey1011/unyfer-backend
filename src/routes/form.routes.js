let express = require("express");
let router = express.Router();

const {
  homepage,
  applyFormData,
  submitContactForm,
  getAllApplyForms,
  getAllContactForms
} = require("../controllers/form.controllers.js");

// Home
router.route("/").get(homepage);

// Apply Form
router.route("/apply").post(applyFormData);

// Contact Form
router.route("/contact").post(submitContactForm);

// =============================
// Admin Routes
// =============================
router.route("/admin/applications").get(getAllApplyForms);
router.route("/admin/contacts").get(getAllContactForms);

module.exports = router;
