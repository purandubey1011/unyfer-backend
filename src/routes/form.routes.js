let express = require("express");
let router = express.Router();

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
router.route("/admin/applications").get(getAllApplyForms);
router.route("/admin/contacts").get(getAllContactForms);

// Zoho Campaign Routes
router.route("/admin/zoho/lists").get(getZohoMailingLists);
router.route("/admin/zoho/campaigns").post(createZohoCampaign);
router.route("/admin/zoho/campaigns/:campaignKey/send").post(sendZohoCampaign);

module.exports = router;
