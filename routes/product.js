const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductDetails,
  adminUpdateProduct,
  adminDeleteProduct,
  getReviewsOfProduct,
  addComment,
  deleteComment,
} = require("../controllers/productController");
const router = express.Router();
const { isLoggedIn, verifyUserRole } = require("../middlewares/user");

router.route("/products").get(getAllProducts);
router.route("/products/:id").get(getProductDetails);

router
  .route("/product/review/:id")
  .get(getReviewsOfProduct)
  .put(isLoggedIn, addComment)
  .delete(isLoggedIn, deleteComment);

// admin
router
  .route("/admin/product")
  .post(isLoggedIn, verifyUserRole("admin"), createProduct);
router
  .route("/admin/product/:id")
  .put(isLoggedIn, verifyUserRole("admin"), adminUpdateProduct)
  .delete(isLoggedIn, verifyUserRole("admin"), adminDeleteProduct);

module.exports = router;
