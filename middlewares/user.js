const User = require('../models/userModel');
const BigPromise = require("./bigPromise");
const cookieToken = require("../utils/cookieToken");
const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = BigPromise(async(req, res, next) => {
    const token = req.cookies.token || req.headers?.Authorization?.replace("Bearer ", '');

    if (!token) {
        return next(new CustomError("Not Authorized, Login To access Data", 401));
    }

    const decryptedId = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decryptedId.id);
    next();
})

exports.verifyUserRole = (...roles) => (req, res, next) => {

    if (!roles.includes(req.user.role)) {
        return next(new CustomError('Access Denied', 403))
    }
    next();
}