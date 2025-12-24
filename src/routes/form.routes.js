let express = require("express");
let router = express.Router();
const { homepage,applyFormData, submitContactForm} = require("../controllers/form.controllers.js");


// home route
router.route("/").get(homepage)

// Creator Apply Form Route
router.route("/apply").post(applyFormData);

// Contact Form Route
router.route("/contact").post(submitContactForm);

module.exports = router;