const mongoose = require("mongoose");
const validator = require("validator");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product Name is Required"],
    trim: true,
    maxLength: [100, "Name should not exceed 100 chars"],
  },
  price: {
    type: Number,
    required: [true, "Product Price is Required"],
    maxLength: [5, "Price should not be more than 5 digits"],
  },
  description: {
    type: String,
    required: [true, "Product Description is Required"],
  },
  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [
      true,
      "Product category musst befrom the list short-sleves long-sleves swestshirts hoodies",
    ],
    enum: {
      values: ["shortSleves", "longSleves", "swestShirts", "hoodies"],
      message:
        "Product category musst befrom the list short-sleves long-sleves swestshirts hoodies",
    },
  },
  brand: {
    type: String,
    default: "TheTStore",
  },
  rating: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    requires: [true, "Provide the Stock available"],
  },
  numOfReviews: {
    type: Number,
  },
  reviews: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true
    },
    comment: {
      type: String,
      required: true,
    },

  }],
  user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
