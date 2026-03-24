let express = require("express");
let router = express.Router();
const { requireAdminAuth } = require("../middlewares/adminAuth.js");

const {
  homepage,
  applyFormData,
  submitContactForm,
  getAllApplyForms,
  getAllContactForms,
  getZohoMailingLists,
  createZohoCampaign,
  sendZohoCampaign,
} = require("../controllers/form.controllers.js");

// Home
router.route("/").get(homepage);

// Apply Form
router.route("/apply").post(applyFormData);

// Contact Form
router.route("/contact").post(submitContactForm);

// Admin Routes
router.route("/admin/applications").get(requireAdminAuth, getAllApplyForms);
router.route("/admin/contacts").get(requireAdminAuth, getAllContactForms);

// Zoho Campaign Routes
router.route("/admin/zoho/lists").get(requireAdminAuth, getZohoMailingLists);
router.route("/admin/zoho/campaigns").post(requireAdminAuth, createZohoCampaign);
router.route("/admin/zoho/campaigns/:campaignKey/send").post(requireAdminAuth, sendZohoCampaign);

module.exports = router;
