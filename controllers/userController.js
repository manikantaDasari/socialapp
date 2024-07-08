const crypto = require("crypto");
const { v2: cloudinary } = require("cloudinary");
const User = require("../models/userModel");
const BigPromise = require("../middlewares/bigPromise");
const cookieToken = require("../utils/cookieToken");
const CustomError = require("../utils/customError");
const mailHelper = require("../utils/emailHelper");

exports.signup = BigPromise(async (req, res, next) => {
  let result = {};
  if (req.files) {
    let file = req.files.photo;
    result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
  }

  const { name, email, password } = req.body;
  if (!email || !name || !password) {
    return next(new Error("Name, Email and Password are required"));
  }

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { password, email } = req.body;

  if (!email || !password) {
    return next(new CustomError("Email and Password are required"));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new CustomError("Email or Password Does not Match or exists"));
  }

  // TODO: Issue with this method
  const isPasswordCorrect = await user.validatePassword(password);

  if (!isPasswordCorrect) {
    return next(new CustomError("Email or Password Does not Match or exists"));
  }

  cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out Sucessfully",
  });
});

exports.getUserDetails = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  return res.status(200).json({
    Success: true,
    user,
  });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new CustomError("User Does not exists", 400));
  }

  const forgotToken = user.getForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  const message = `Use this Url ${myUrl}`;

  try {
    await mailHelper({
      toEmail: email,
      subject: "TheTstore - Reset Password",
      message: message,
    });
    return res.status(200).json({
      success: true,
      message: "Reset Sucess",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new CustomError(error.message, 500));
  }
});

exports.resetPassword = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  const { password, confirmPassword } = req.body;

  const encryptToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: encryptToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new CustomError("Token is Invaliad or expired. try again", 400)
    );
  }

  if (password !== confirmPassword) {
    return next(
      new CustomError("confirmPassword and password doesnt match.", 400)
    );
  }

  user.password = password;
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;

  await user.save();

  cookieToken(user, res);
});

exports.changePassword = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isOldPasswordCorrect = await user.validatePassword(
    req.body.oldPassword
  );

  if (!isOldPasswordCorrect) {
    return next(new CustomError("Wrong Password", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  cookieToken(user, res);
});

exports.updatePassword = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  return res.status(200).json({
    Success: true,
    user,
  });
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  // add a check for email and name in body

  // collect data from body
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  // if photo comes to us
  if (req.files) {
    const user = await User.findById(req.user.id);

    const imageId = user.photo.id;

    // delete photo on cloudinary
    const resp = await cloudinary.uploader.destroy(imageId);

    // upload the new photo
    const result = await cloudinary.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    );

    // add photo data in newData object
    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  // update the data in user
  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

exports.adminGetAllusers = BigPromise(async (req, res, next) => {
  const users = await User.find();
  return res.status(200).json({
    Success: true,
    users,
  });
});

exports.adminGetUser = BigPromise(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findById(id);

  if (!user) {
    return next(new CustomError("User Not Found", 404));
  }

  return res.status(200).json({
    Success: true,
    user,
  });
});

exports.adminUpdateOneUser = BigPromise(async (req, res, next) => {
  const newData = {
    ...req.body,
  };
  await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  return res.status(200).json({
    success: true,
  });
});

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findById(id);

  if (!user) {
    return next(new CustomError("User Not Found", 404));
  }

  const imageReference = user.photo.id;
  await cloudinary.uploader.destroy(imageReference);

  await user.remove();
  return res.status(200).json({
    success: true,
  });
});

exports.managerGetAllusers = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" });
  return res.status(200).json({
    Success: true,
    users,
  });
});
