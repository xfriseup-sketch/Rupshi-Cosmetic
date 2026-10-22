import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "ক্যাটেগরির নাম আবশ্যক"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers and dashes"],
    },
    icon: {
      type: String,
      trim: true,
      default: "🛍️",
    },
    // Phase 6 — nested categories & homepage visibility
    parentCategory: {
      // null = main category; ObjectId = sub-category of that main category
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    isHomeVisible: {
      // Only main categories with this flag show on the homepage
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "categories" }
);

// Prevent overwriting the model on hot reloads / repeated imports
let Category = mongoose.models.Category;

if (!Category) {
  Category = mongoose.model("Category", CategorySchema);
} else if (!Category.schema.paths.parentCategory || !Category.schema.paths.isHomeVisible) {
  // An older compiled model (e.g. from a previous hot reload) may lack the new
  // Phase 6 paths — add them so queries/validations keep working.
  const additions = {};
  if (!Category.schema.paths.parentCategory) {
    additions.parentCategory = { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null };
  }
  if (!Category.schema.paths.isHomeVisible) {
    additions.isHomeVisible = { type: Boolean, default: false };
  }
  Category.schema.add(additions);
}

export default Category;

/**
 * Generate a URL-friendly slug. Bengali characters don't transliterate, so
 * if nothing survives sanitization we fall back to a short random suffix —
 * the human-readable name is always kept separately in `name`.
 */
export function generateSlug(name) {
  const base = (name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `cat-${Date.now().toString(36)}`;
}
