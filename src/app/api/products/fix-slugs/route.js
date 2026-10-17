import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import Product, { ensureUniqueSlug } from "@/models/Product";

export const dynamic = "force-dynamic";

/**
 * GET /api/products/fix-slugs
 * One-time migration helper: generates slugs for every legacy product that
 * doesn't have one yet. Visit this URL once after deploying to make all old
 * products openable on /product/[slug].
 */
export async function GET() {
  try {
    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const withoutSlug = await Product.find({ $or: [{ slug: null }, { slug: "" }] }).lean();
    const fixed = [];

    for (const p of withoutSlug) {
      const slug = await ensureUniqueSlug(Product, p._id, p.name);
      await Product.updateOne({ _id: p._id }, { $set: { slug } });
      fixed.push({ id: p._id.toString(), name: p.name, slug });
    }

    return NextResponse.json({
      success: true,
      message: `${fixed.length}টি প্রোডাক্টের জন্য slug তৈরি হয়েছে`,
      total: withoutSlug.length,
      fixed,
    });
  } catch (error) {
    console.error("FIX SLUGS FAILED:", error);
    return NextResponse.json(
      { success: false, message: error?.message || String(error) },
      { status: 500 }
    );
  }
}
