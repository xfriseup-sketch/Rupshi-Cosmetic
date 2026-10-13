/* Temporary seed script for local verification (not committed) */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import fs from "fs";

const mongod = await MongoMemoryServer.create();
const uri = mongod.getUri("rupshi");
fs.writeFileSync("/tmp/mongo_uri.txt", uri);
console.log(uri);

await mongoose.connect(uri);

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, enum: ["Skincare", "Makeup", "Haircare", "Fragrance"] },
  image: String,
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});
const Product = mongoose.model("Product", ProductSchema);

await Product.create([
  { name: "নিয়সিন অ্যাকনে ফেসওয়াশ", description: "ব্রণ প্রতিরোধে কার্যকরী জেল ফেসওয়াশ।", price: 350, category: "Skincare", image: "https://picsum.photos/seed/facewash/400/400" },
  { name: "ভিটামিন সি সিরাম", description: "উজ্জ্বল ত্বকের জন্য ২০% ভিটামিন সি সিরাম।", price: 850, category: "Skincare", image: "https://picsum.photos/seed/serum/400/400" },
  { name: "ম্যাট লিপস্টিক", description: "দীর্ঘস্থায়ী ম্যাট ফিনিশ, ৬টি শেড।", price: 450, category: "Makeup", image: "https://picsum.photos/seed/lipstick/400/400" },
  { name: "ফাউন্ডেশন প্যাকেট", description: "সব ধরনের ত্বকের উপযোগী এলএইচ ফাউন্ডেশন।", price: 1200, category: "Makeup", image: "https://picsum.photos/seed/foundation/400/400", inStock: false },
  { name: "হার্বাল হেয়ার অয়েল", description: "আমলা ও ব্রাহ্মীতে সমৃদ্ধ চুলের তেল।", price: 260, category: "Haircare", image: "https://picsum.photos/seed/hairoil/400/400" },
  { name: "রোজ পারফিউম ৫০ml", description: "গোলাপের সুবাসে ভরা দীর্ঘস্থায়ী পারফিউম।", price: 950, category: "Fragrance", image: "https://picsum.photos/seed/perfume/400/400" },
]);

console.log("Seeded", await Product.countDocuments(), "products. Server keeps running...");
// Keep process alive so the in-memory server stays up
setInterval(() => {}, 1 << 30);
