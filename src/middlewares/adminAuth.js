const ErrorHandler = require("../utils/ErrorHandler");
const { verifyAdminToken } = require("../utils/adminToken");

exports.requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new ErrorHandler("Admin authorization required.", 401));
  }

  const verification = verifyAdminToken(token);

  if (!verification.valid) {
    return next(new ErrorHandler(verification.reason || "Invalid admin session.", 401));
  }

  req.admin = verification.payload;
  return next();
};
