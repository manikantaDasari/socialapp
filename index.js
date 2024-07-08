const app = require("./app");
const connectWithDb = require("./config/db");
require("dotenv").config();

const cloudnary = require("cloudinary");

// connection with DB
connectWithDb();

// cloudnary connection config

cloudnary.config({
  cloud_name: process.env.CLOUDNARY_NAME,
  api_key: process.env.CLOUDNARY_API_KEY,
  api_secret: process.env.CLOUDNARY_API_SECRET,
});

app.listen(process.env.PORT, () =>
  console.log(`app is running on port: ${process.env.PORT} `)
);