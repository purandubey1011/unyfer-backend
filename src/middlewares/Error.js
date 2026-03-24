exports.generatedErrors = async (err, req, res, next) => {
  let statusCode = err.statusCode || 500;

  if (err.name === "mongoServerError" && err.message.includes("E11000 duplicate key")) {
    err.message = "User with this email or contact already exists";
  }

  const isProduction = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server error",
    errorName: err.name,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
