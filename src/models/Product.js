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
    isHotOffer: {
      // Phase 7.6 — shown in the homepage "হট অফার" section (?hotOffer=true)
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
    slug: {
      // URL-friendly identifier used by the single product page
      // (/product/[slug]). Auto-generated from `name` below.
      type: String,
      lowercase: true,
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

/**
 * Generate a URL-safe slug from the product name.
 * Bengali/unicode characters are kept; spaces/punctuation become hyphens.
 */
export function generateSlug(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[\s~+_/\\]+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Prevent overwriting the model on hot reloads / repeated imports
let Product = mongoose.models.Product;

if (!Product) {
  Product = mongoose.model("Product", ProductSchema);
} else if (
  !Product.schema.paths.isFeatured ||
  !Product.schema.paths.isNew ||
  !Product.schema.paths.isHotOffer ||
  !Product.schema.paths.discountPrice ||
  !Product.schema.paths.brand ||
  !Product.schema.paths.slug
) {
  // An older compiled model (e.g. from a previous hot reload) may lack the new
  // Phase 6/7 paths — add them so queries/validations keep working.
  const additions = {};
  if (!Product.schema.paths.isFeatured) additions.isFeatured = { type: Boolean, default: false };
  if (!Product.schema.paths.isNew) additions.isNew = { type: Boolean, default: false };
  if (!Product.schema.paths.isHotOffer) additions.isHotOffer = { type: Boolean, default: false };
  if (!Product.schema.paths.discountPrice) additions.discountPrice = { type: Number, default: null, min: 0 };
  if (!Product.schema.paths.brand) additions.brand = { type: String, trim: true };
  if (!Product.schema.paths.slug) additions.slug = { type: String, lowercase: true, trim: true };
  Product.schema.add(additions);
}

/**
 * Auto-generate & de-duplicate a unique slug for a product payload BEFORE it
 * is written to MongoDB. Used by the API routes because `findByIdAndUpdate`
 * and bulk writes bypass Mongoose `pre("save")` hooks.
 */
export async function ensureUniqueSlug(ProductModel, excludeId, name) {
  const base = generateSlug(name || "") || "product";
  let candidate = base;
  for (let i = 1; i < 100; i++) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const clash = await ProductModel.findOne(query).select("_id").lean();
    if (!clash) break;
    candidate = `${base}-${i}`;
  }
  return candidate;
}

export default Product;
