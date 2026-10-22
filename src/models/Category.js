import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "ক্যাটেগরির নাম আবশ্যক"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers and dashes"],
    },
    icon: {
      type: String,
      trim: true,
      default: "🛍️",
    },
    // Which shop section this category belongs to
    department: {
      type: String,
      enum: ["beauty", "fashion", "tech"],
      required: [true, "Department is required"],
      default: "beauty",
      index: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    isHomeVisible: {
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

// Same name/slug can exist in different departments
CategorySchema.index({ name: 1, department: 1 }, { unique: true });
CategorySchema.index({ slug: 1, department: 1 }, { unique: true });

let Category = mongoose.models.Category;

if (!Category) {
  Category = mongoose.model("Category", CategorySchema);
} else {
  const additions = {};
  if (!Category.schema.paths.parentCategory) {
    additions.parentCategory = {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    };
  }
  if (!Category.schema.paths.isHomeVisible) {
    additions.isHomeVisible = { type: Boolean, default: false };
  }
  if (!Category.schema.paths.department) {
    additions.department = {
      type: String,
      enum: ["beauty", "fashion", "tech"],
      default: "beauty",
      index: true,
    };
  }
  if (Object.keys(additions).length) Category.schema.add(additions);
}

export default Category;

export function generateSlug(name) {
  const base = (name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `cat-${Date.now().toString(36)}`;
}
