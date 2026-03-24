const ErrorHandler = require("../utils/ErrorHandler");

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attemptsByIp = new Map();

exports.adminLoginRateLimit = (req, res, next) => {
  const now = Date.now();
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  const current = attemptsByIp.get(ip);

  if (!current || current.expiresAt <= now) {
    attemptsByIp.set(ip, {
      count: 1,
      expiresAt: now + WINDOW_MS,
    });
    return next();
  }

  if (current.count >= MAX_ATTEMPTS) {
    return next(
      new ErrorHandler("Too many admin login attempts. Please try again later.", 429)
    );
  }

  current.count += 1;
  attemptsByIp.set(ip, current);
  return next();
};
