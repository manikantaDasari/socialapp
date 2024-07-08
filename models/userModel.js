const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is Required"],
    maxLength: [40, "Name should be under 40 chars"],
  },
  email: {
    type: String,
    required: [true, "email is Required"],
    validate: [validator.isEmail, "Please enter corrent Email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is Required"],
    validate: [validator.isStrongPassword, "Please enter strong Password"],
    select: false,
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// password encryption before saving - Hooks
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // if the password is not modified it wont encrypt;

  // if the password is new or modified this gets excuted
  this.password = await bcrypt.hash(this.password, 10);
});

// validate the password passed on with the existing password in dB.
userSchema.methods.validatePassword = async function (passcodeFromApi) {
  return await bcrypt.compare(passcodeFromApi, this.password);
};

// create and return JWT Token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

// generayte a forgot password token (string)
userSchema.methods.getForgotPasswordToken = function () {
  // generate a long and random string
  const forgotToken = crypto.randomBytes(20).toString("hex");

  // getting a hash and setting forgotPasswordToken - make sure to get a hash on backend
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  // setting expiry time for token
  this.forgotPasswordExpiry = Date.now() + 60 * 60 * 1000; // 60 min

  return forgotToken;
};

module.exports = mongoose.model("User", userSchema);
