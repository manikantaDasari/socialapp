const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
require('ejs')

// for swagger documentation
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDoc = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
require("dotenv").config();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
  })
);

// temp check

app.set("view engine", "ejs");
// morgan middleware
app.use(morgan("tiny"));

// import all routes
const home = require("./routes/home");
const user = require("./routes/user");

// router middleware
app.use("/api/v1", home);
app.use("/api/v1", user);

app.get("/signup", (req, res) => res.render("signup"));
// export app js
module.exports = app;
