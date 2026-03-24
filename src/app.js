require("dotenv").config({ path: "./.env" });

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const ErrorHandler = require("./utils/ErrorHandler");
const { generatedErrors } = require("./middlewares/Error.js");

const app = express();

const defaultDevOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const allowedOrigins = (process.env.CORS_ORIGINS || "https://frontend-ten-lovat-42.vercel.app")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const corsOrigins =
  process.env.NODE_ENV === "production"
    ? allowedOrigins
    : [...new Set([...defaultDevOrigins, ...allowedOrigins])];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new ErrorHandler("CORS origin not allowed.", 403));
    },
  })
);

app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

require("./models/database.js").connectDatabase();

app.use("/api/v1/form/", require("./routes/form.routes.js"));
app.use("/api/v1/download/", require("./routes/download.routes.js"));
app.use("/api/v1/admin/auth/", require("./routes/adminAuth.routes.js"));

app.use(/(.*)/, (req, res, next) => {
  next(new ErrorHandler(`Requested URL Not Found: ${req.url}`, 404));
});

app.use(generatedErrors);

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
