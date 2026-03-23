const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ApplyForm = require("../models/formSchema.js");
const Contact = require("../models/ContactSchema");
const ErrorHandler = require("../utils/ErrorHandler");
const {
  fetchMailingLists,
  createCampaign,
  sendCampaign,
} = require("../services/zohoCampaign.service");

const extractCampaignKey = (payload) => {
  if (!payload || typeof payload !== "object") return null;

  const stack = [payload];
  while (stack.length) {
    const current = stack.pop();

    if (Array.isArray(current)) {
      current.forEach((item) => stack.push(item));
      continue;
    }

    if (typeof current !== "object" || current === null) continue;

    if (current.campaignkey) return current.campaignkey;
    if (current.campaignKey) return current.campaignKey;

    Object.values(current).forEach((value) => {
      if (typeof value === "object" && value !== null) {
        stack.push(value);
      }
    });
  }

  return null;
};

exports.homepage = catchAsyncErrors(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to falverra",
  });
});

exports.applyFormData = catchAsyncErrors(async (req, res) => {
  try {
    const { username, email, phone, followers, isCreator } = req.body;

    if (!username || !email || !phone || !followers || !isCreator) {
      return res.status(400).json({
        error: "All fields (username, email, phone, followers, isCreator) are required.",
      });
    }

    const applyData = { username, email, phone, followers, isCreator };
    console.log("Apply Form Received:", applyData);

    const newEntry = new ApplyForm(applyData);
    await newEntry.save();

    return res.status(200).json({
      message: "Application submitted successfully.",
      data: applyData,
    });
  } catch (err) {
    console.error("Apply form error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

exports.submitContactForm = catchAsyncErrors(async (req, res) => {
  const { name, mobile, email, subject, message } = req.body;

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

exports.getAllContactForms = catchAsyncErrors(async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    total: contacts.length,
    data: contacts,
  });
});

exports.getZohoMailingLists = catchAsyncErrors(async (req, res) => {
  const result = await fetchMailingLists();

  return res.status(200).json({
    success: true,
    message: "Zoho mailing lists fetched successfully.",
    data: result,
  });
});

exports.createZohoCampaign = catchAsyncErrors(async (req, res, next) => {
  const {
    campaignName,
    subject,
    fromName,
    fromEmail,
    replyTo,
    listKey,
    htmlContent,
    rawPayload,
  } = req.body;

  if (!campaignName || !subject || !fromEmail || !replyTo || !listKey || !htmlContent) {
    return next(
      new ErrorHandler(
        "campaignName, subject, fromEmail, replyTo, listKey and htmlContent are required.",
        400
      )
    );
  }

  const payload = {
    campaignname: campaignName,
    subject,
    from_name: fromName,
    from_email: fromEmail,
    reply_to: replyTo,
    listkey: listKey,
    content: htmlContent,
    ...((rawPayload && typeof rawPayload === "object" && !Array.isArray(rawPayload))
      ? rawPayload
      : {}),
  };

  const result = await createCampaign(payload);
  const campaignKey = extractCampaignKey(result);

  return res.status(200).json({
    success: true,
    message: "Zoho campaign created successfully.",
    campaignKey,
    data: result,
  });
});

exports.sendZohoCampaign = catchAsyncErrors(async (req, res, next) => {
  const campaignKey = req.params.campaignKey || req.body.campaignKey;
  const additionalPayload = req.body.rawPayload;

  if (!campaignKey) {
    return next(new ErrorHandler("campaignKey is required.", 400));
  }

  const result = await sendCampaign(
    campaignKey,
    additionalPayload && typeof additionalPayload === "object" && !Array.isArray(additionalPayload)
      ? additionalPayload
      : {}
  );

  return res.status(200).json({
    success: true,
    message: "Zoho campaign send request submitted.",
    data: result,
  });
});
