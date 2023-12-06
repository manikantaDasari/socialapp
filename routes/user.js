const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  changePassword,
  adminGetAllusers,
  managerGetAllusers,
  adminGetUser,
  adminUpdateOneUser,
  adminDeleteOneUser,
  updateUserDetails
} = require("../controllers/userController");
const { isLoggedIn, verifyUserRole } = require("../middlewares/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/userdashboard").get(isLoggedIn, getUserDetails);
router.route("/userdashboard/update").put(isLoggedIn, updateUserDetails);
router.route("/password/changepassword").post(isLoggedIn, changePassword);
router
  .route("/admin/users")
  .get(isLoggedIn, verifyUserRole("admin"), adminGetAllusers);

router
  .route("/admin/user/:id")
  .get(isLoggedIn, verifyUserRole("admin"), adminGetUser)
  .put(isLoggedIn, verifyUserRole("admin"), adminUpdateOneUser)
  .delete(isLoggedIn, verifyUserRole("admin"), adminDeleteOneUser);

router
  .route("/manager/users")
  .get(isLoggedIn, verifyUserRole("manager", "admin"), managerGetAllusers);

module.exports = router;
