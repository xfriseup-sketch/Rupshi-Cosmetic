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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "categories" }
);

// Prevent overwriting the model on hot reloads / repeated imports
const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);

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
