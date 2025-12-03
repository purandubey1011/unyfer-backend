let express = require("express");
let router = express.Router();
const { homepage,applyFormData} = require("../controllers/form.controllers.js");


// home route
router.route("/").get(homepage)

// Creator Apply Form Route
router.route("/apply").post(applyFormData);

module.exports = router;