const { v2: cloudinary } = require("cloudinary");
const Product = require("../models/productModel");
const BigPromise = require("../middlewares/bigPromise");
const WhereClause = require("../utils/whereClause");
const CustomError = require("../utils/customError");

exports.createProduct = BigPromise(async (req, res, next) => {
  let imageArray = [];

  if (!req.files) {
    return next(new CustomError("Images are Requires", 401));
  }

  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      const element = req.files.photos[index];
      let result = await cloudinary.uploader.upload(element.tempFilePath, {
        folder: "products",
      });
      imageArray.push({ id: result.public_id, secure_url: result.secure_url });
    }
  }

  req.body.photos = imageArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getAllProducts = BigPromise(async (req, res, next) => {
  const limit = 10;
  const totalCOuntPerPage = await Product.countDocuments();
  let productsObj = new WhereClause(Product.find({}), req.query)
    .search()
    .filter();
  let products = await productsObj.base;
  const filteredProductsLength = products.length;
  productsObj.pager(limit);
  products = await productsObj.base.clone();

  return res.status(200).json({
    success: true,
    products,
    totalCOuntPerPage,
    filteredProductsLength,
  });
});

exports.getProductDetails = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("Product not Found", 404));
  }

  return res.status(200).json({
    success: true,
    product,
  });
});

exports.addComment = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("Product not Found", 404));
  }

  if (!rating || !comment) {
    return next(new CustomError("Please Provide Rating and Review", 404));
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    comment,
    rating: Number(rating),
  };

  const isReviewedAlready = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewedAlready) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.comment = comment;
        rev.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  product.rating =
    product.reviews.reduce((acc, rev) => {
      return acc + rev.rating;
    }, 0) / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
  });
});

exports.deleteComment = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("Product not Found", 404));
  }

  const isReviewedAlready = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  let reviews;
  if (isReviewedAlready) {
    reviews = product.reviews.filter(
      (rev) => rev.user.toString() !== req.user._id.toString()
    );
  } else {
    return next(
      new CustomError("You have not reviewed for this product Yet", 404)
    );
  }

  const numOfReviews = reviews.length;

  product.rating =
    reviews.reduce((acc, rev) => {
      acc + rev.rating;
    }, 0) / numOfReviews;

  await Product.findByIdAndUpdate(
    req.params.id,
    {
      reviews,
      numOfReviews,
      rating,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  await Product.save();

  return res.status(200).json({
    success: true,
  });
});

exports.getReviewsOfProduct = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("Product not Found", 404));
  }

  return res.status(200).json({
    success: true,
    id: req.params.id,
    reviews: product.reviews,
    rating: product.rating,
  });
});

// Admin Controlls

exports.adminUpdateProduct = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  let imageArray = [];

  if (!product) {
    return next(new CustomError("Product not Found", 404));
  }

  if (req.files) {
    for (let index = 0; index < product.photos.length; index++) {
      const element = product.photos[index].id;
      await cloudinary.uploader.destroy(element);
    }

    for (let index = 0; index < req.files.photos.length; index++) {
      const element = req.files.photos[index];
      let result = await cloudinary.uploader.upload(element.tempFilePath, {
        folder: "products",
      });
      imageArray.push({ id: result.public_id, secure_url: result.secure_url });
    }
  }

  req.body.photos = imageArray;
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    success: true,
    product,
  });
});

exports.adminDeleteProduct = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("Product not Found", 404));
  }

  if (product.photos.length > 0) {
    for (let index = 0; index < product.photos.length; index++) {
      const element = product.photos[index].id;
      await cloudinary.uploader.destroy(element);
    }
  }

  await Product.findByIdAndDelete(req.params.id);

  return res.status(200).json({
    success: true,
  });
});
