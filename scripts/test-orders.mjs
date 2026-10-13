/* Temporary end-to-end test for POST /api/orders (not committed) */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import fs from "fs";

const mongod = await MongoMemoryServer.create();
const uri = mongod.getUri("rupshi");
fs.writeFileSync("/tmp/mongo_uri_orders.txt", uri);

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
const created = await Product.create([
  { name: "ভিটামিন সি সিরাম", price: 850, category: "Skincare", image: "https://picsum.photos/seed/serum/400/400" },
  { name: "ম্যাট লিপস্টিক", price: 450, category: "Makeup", image: "https://picsum.photos/seed/lipstick/400/400" },
]);
console.log("PRODUCT_IDS=" + created.map(p => p._id.toString()).join(","));
await mongoose.disconnect();
await new Promise(r => setTimeout(r, 1000));
process.exit(0);
