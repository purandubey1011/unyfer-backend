const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const DownloadForm = require("../models/downloadSchema.js");

exports.submitDownloadForm = catchAsyncErrors(async (req, res) => {
  try {
    const { username, email, phone, followers, isCreator, platform } = req.body;

    if (!username || !email || !phone || !followers || !isCreator || !platform) {
      return res.status(400).json({
        error:
          "All fields (username, email, phone, followers, isCreator, platform) are required.",
      });
    }

    const downloadData = { username, email, phone, followers, isCreator, platform };
    console.log("Download Form Received:", downloadData);

    const newEntry = new DownloadForm(downloadData);
    await newEntry.save();

    return res.status(200).json({
      success: true,
      message: "Download form submitted successfully.",
      data: downloadData,
    });
  } catch (err) {
    console.error("Download form error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

exports.getAllDownloadForms = catchAsyncErrors(async (req, res) => {
  const downloads = await DownloadForm.find().sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    total: downloads.length,
    data: downloads,
  });
});
