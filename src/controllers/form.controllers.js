const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js")
const ApplyForm = require("../models/formSchema.js");
const Contact = require("../models/ContactSchema");

// home page tasting 
exports.homepage = catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "Welcome to falverra"
    })
})

// =============================
// Apply Form Submit Controller
// =============================
exports.applyFormData = catchAsyncErrors(async (req, res, next) => {
  try {
    const { username, email, phone, followers, isCreator } = req.body;

    // 🛑 Validate required fields
    if (!username || !email || !phone || !followers || !isCreator) {
      return res.status(400).json({
        error: "All fields (username, email, phone, followers, isCreator) are required.",
      });
    }

    // Data object
    const applyData = { username, email, phone, followers, isCreator };
    console.log("Apply Form Received:", applyData);

    // 💾 Save in database
    const newEntry = new ApplyForm(applyData);
    await newEntry.save();

    // ✉️ (OPTIONAL) Send email – uncomment when transporter exists
    /*
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Application Was Received!",
        html: `
          <h3>Thank you ${username}!</h3>
          <p>We have received your creator access application.</p>
        `,
      });
    } catch (mailErr) {
      console.error("Email sending error:", mailErr);
    }
    */

    return res.status(200).json({
      message: "Application submitted successfully.",
      data: applyData,
    });
  } catch (err) {
    console.error("Apply form error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


// =============================
// Contact Form Submit Controller
// =============================
exports.submitContactForm = catchAsyncErrors(async (req, res) => {
  const { name, mobile, email, subject, message } = req.body;

  // 🛑 Required validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Name, Email and Message are required.",
    });
  }

  const contactData = {
    name,
    mobile,
    email,
    subject,
    message,
  };

  console.log("Contact Form Received:", contactData);

  // 💾 Save to DB
  const newContact = await Contact.create(contactData);

  return res.status(200).json({
    success: true,
    message: "Contact form submitted successfully.",
    data: newContact,
  });
});

exports.getAllApplyForms = catchAsyncErrors(async (req, res) => {
  const applications = await ApplyForm.find().sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    total: applications.length,
    data: applications,
  });
});


// =============================
// Get All Contact Forms (Admin)
// =============================
exports.getAllContactForms = catchAsyncErrors(async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    total: contacts.length,
    data: contacts,
  });
});
