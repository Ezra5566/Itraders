const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    images: [String], // Array of image URLs
    mainImage: String, // Main product image
    title: String,
    description: String,
    category: String,
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    specifications: {
      type: Map,
      of: String
    },
    features: [String],
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: String
    },
    weight: {
      value: Number,
      unit: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
