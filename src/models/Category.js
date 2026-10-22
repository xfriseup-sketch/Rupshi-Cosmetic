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
      default: "",
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

let Category = mongoose.models.Category;

if (!Category) {
  Category = mongoose.model("Category", CategorySchema);
} else if (!Category.schema.paths.parentCategory || !Category.schema.paths.isHomeVisible) {
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
  Category.schema.add(additions);
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
