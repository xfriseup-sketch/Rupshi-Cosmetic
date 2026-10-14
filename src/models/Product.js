import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
      // Categories are now managed dynamically via the admin panel
      // (src/models/Category.js), so this field stores the category NAME.
      // The default set below keeps existing data valid.
      default: "Skincare",
    },
    image: {
      type: String,
      // URL validation
      match: [/^https?:\/\/.+/i, "Image must be a valid URL"],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "products" }
);

// Prevent overwriting the model on hot reloads / repeated imports
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
