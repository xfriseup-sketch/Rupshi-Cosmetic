/**
 * Seed script — populates the database with demo products for Rupshi-Cosmetic.
 * Usage: node scripts/seed.mjs   (reads MONGODB_URI from .env.local)
 */
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";

// Load .env.local if present
try {
  const env = await readFile(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch {
  /* no .env.local — rely on exported env */
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Copy .env.example to .env.local first.");
  process.exit(1);
}

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    image: { type: String, match: [/^https?:\/\/.+/i, "Image must be a valid URL"] },
    inStock: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "products" }
);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

await mongoose.connect(uri);

const demoProducts = [
  { name: "ভিটামিন সি সিরাম", description: "উজ্জ্বল ত্বকের জন্য ভিটামিন সি ফেস সিরাম", price: 850, category: "Skincare", image: "https://picsum.photos/seed/serum/400/400" },
  { name: "ম্যাট লিপস্টিক", description: "দীর্ঘস্থায়ী ম্যাট ফিনিশ লিপস্টিক", price: 450, category: "Makeup", image: "https://picsum.photos/seed/lipstick/400/400" },
  { name: "হায়ালুরনিক ক্রিম", description: "গভীর ময়েশ্চারাইজিং ফেস ক্রিম", price: 650, category: "Skincare", image: "https://picsum.photos/seed/cream/400/400" },
  { name: "অার্গান অয়েল শ্যাম্পু", description: "চুলের গোড়া মজবুতকারী শ্যাম্পু", price: 380, category: "Haircare", image: "https://picsum.photos/seed/shampoo/400/400" },
  { name: "রোজ ওয়াটার মিষ্ট", description: "তাজা অনুভূতির রোজ ওয়াটার স্প্রে", price: 320, category: "Skincare", image: "https://picsum.photos/seed/rose/400/400" },
  { name: "পারফিউম ব্ল্যাম", description: "দীর্ঘস্থায়ী ফুলেল সুগন্ধি", price: 1200, category: "Fragrance", image: "https://picsum.photos/seed/perfume/400/400" },
];

// ---- Categories collection (dynamic category management) ----
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String, default: "🛍️" },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "categories" }
);
const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);

const demoCategories = [
  { name: "Skincare", slug: "skincare", icon: "🧴" },
  { name: "Makeup", slug: "makeup", icon: "💄" },
  { name: "Haircare", slug: "haircare", icon: "💇‍♀️" },
  { name: "Fragrance", slug: "fragrance", icon: "🌸" },
];

await Product.deleteMany({});
const created = await Product.create(demoProducts);
console.log(`Seeded ${created.length} products ✔`);

await Category.deleteMany({});
const createdCats = await Category.create(demoCategories);
console.log(`Seeded ${createdCats.length} categories ✔`);

await mongoose.disconnect();
