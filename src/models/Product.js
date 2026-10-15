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
    // Phase 6 — homepage & shop controls
    isFeatured: {
      // Featured products are shown in the homepage "জনপ্রিয় প্রোডাক্ট" section
      type: Boolean,
      default: false,
    },
    isNew: {
      // Shows a "NEW" badge on product cards
      type: Boolean,
      default: false,
    },
    discountPrice: {
      // Optional discounted price (must be lower than `price`)
      type: Number,
      default: null,
      min: [0, "Discount price cannot be negative"],
    },
    brand: {
      // Required for brand filtering on the shop page
      type: String,
      required: [true, "Product brand is required"],
      trim: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "products" }
);

// Prevent overwriting the model on hot reloads / repeated imports
let Product = mongoose.models.Product;

if (!Product) {
  Product = mongoose.model("Product", ProductSchema);
} else {
  // Existing model (e.g. compiled from an older schema during hot reload) may
  // lack the new Phase 6 paths — add them so queries/validations keep working.
  const additions = {};
  if (!Product.schema.paths.isFeatured) additions.isFeatured = { type: Boolean, default: false };
  if (!Product.schema.paths.isNew) additions.isNew = { type: Boolean, default: false };
  if (!Product.schema.paths.discountPrice) additions.discountPrice = { type: Number, default: null, min: 0 };
  if (!Product.schema.paths.brand) additions.brand = { type: String, trim: true };
  if (Object.keys(additions).length > 0) Product.schema.add(additions);
}

export default Product;
