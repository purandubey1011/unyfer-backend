const crypto = require("crypto");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler");
const { signAdminToken } = require("../utils/adminToken");

const DEFAULT_ADMIN_EMAIL = "admin@unyfer.com";
const DEFAULT_ADMIN_PASSWORD = "Admin@123";

const safeCompare = (input, expected) => {
  const inputBuffer = Buffer.from(input || "");
  const expectedBuffer = Buffer.from(expected || "");

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
};

exports.loginAdmin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required.", 400));
  }

  const adminEmail = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)
  ) {
    return next(
      new ErrorHandler(
        "ADMIN_EMAIL and ADMIN_PASSWORD must be configured in production.",
        500
      )
    );
  }

  const isValidEmail = safeCompare(email, adminEmail);
  const isValidPassword = safeCompare(password, adminPassword);

  if (!isValidEmail || !isValidPassword) {
    return next(new ErrorHandler("Invalid admin credentials.", 401));
  }

  const token = signAdminToken({ email: adminEmail });

  return res.status(200).json({
    success: true,
    message: "Admin login successful.",
    token,
    admin: {
      email: adminEmail,
    },
    expiresInHours: Number(process.env.ADMIN_SESSION_HOURS || 24),
  });
});

exports.getAdminSession = catchAsyncErrors(async (req, res) => {
  return res.status(200).json({
    success: true,
    admin: {
      email: req.admin.email,
    },
  });
});
