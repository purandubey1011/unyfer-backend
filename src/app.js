require('dotenv').config({ path: './.env' });

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

// 2️⃣ CORS
app.use(cors({
  origin: "*",   // allow all origins (no cookies needed)
}));


// 3️⃣ Logger
app.use(morgan('tiny'));

// 4️⃣ Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 5️⃣ Connect to Database
require('./models/database.js').connectDatabase();

// 6️⃣ Routes
app.use('/api/v1/form/', require('./routes/form.routes.js'));

// 7️⃣ Error for Unmatched Routes
const ErrorHandler = require('./utils/ErrorHandler');
const { generatedErrors } = require('./middlewares/Error.js');

app.use(/(.*)/, (req, res, next) => {
  next(new ErrorHandler(`Requested URL Not Found: ${req.url}`, 404));
});

// 8️⃣ Error Middleware
app.use(generatedErrors);

// 9️⃣ Start Server
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
});
