import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import Product, { ensureUniqueSlug } from "@/models/Product";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/products/[id]
 * Partial update of a single product (admin panel edit).
 * Next.js 14: `params` is a Promise — it MUST be awaited.
 */
async function updateProduct(request, params) {
  try {
    // ---- extract & validate the ID from the URL ----
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: `অবৈধ প্রোডাক্ট আইডি: "${id}"` },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "রিকোয়েস্ট বডি পড়া যায়নি" },
        { status: 400 }
      );
    }

    // ---- allowed fields only (isFeatured/isNew included → Phase 7 fix) ----
    const updates = {};
    const allowedFields = [
      "name", "description", "price", "category", "image",
      "inStock", "brand", "isFeatured", "isNew", "discountPrice",
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    // Basic sanity checks
    if (updates.price !== undefined && (Number.isNaN(Number(updates.price)) || Number(updates.price) < 0)) {
      return NextResponse.json({ success: false, message: "সঠিক দাম দিন" }, { status: 400 });
    }
    if (updates.discountPrice !== undefined && updates.discountPrice !== null && updates.discountPrice !== "") {
      updates.discountPrice = Number(updates.discountPrice);
      if (Number.isNaN(updates.discountPrice) || updates.discountPrice < 0) {
        return NextResponse.json({ success: false, message: "সঠিক ডিসকাউন্ট দাম দিন" }, { status: 400 });
      }
    } else {
      updates.discountPrice = null;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, message: "আপডেট করার মতো কিছু পাওয়া যায়নি" }, { status: 400 });
    }

    const existing = await Product.findById(id).select("name slug").lean();
    if (!existing) {
      return NextResponse.json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" }, { status: 404 });
    }

    // ---- slug: generate when missing or when name changed ----
    if (updates.name) updates.name = String(updates.name).trim();
    if (!existing.slug || (updates.name && updates.name !== existing.name)) {
      updates.slug = await ensureUniqueSlug(Product, id, updates.name || existing.name);
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!product) {
      return NextResponse.json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "প্রোডাক্ট আপডেট হয়েছে",
      product: { ...product, _id: product._id.toString() },
    });
  } catch (error) {
    console.error("PRODUCT UPDATE FAILED:", error);
    return NextResponse.json(
      { success: false, message: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(request, context) {
  return updateProduct(request, context?.params);
}

// PUT also routes to the same handler for compatibility
export async function PUT(request, context) {
  return updateProduct(request, context?.params);
}

/**
 * DELETE /api/products/[id]
 */
export async function DELETE(request, context) {
  try {
    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: `অবৈধ প্রোডাক্ট আইডি: "${id}"` },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const product = await Product.findByIdAndDelete(id).lean();
    if (!product) {
      return NextResponse.json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "প্রোডাক্ট মুছে ফেলা হয়েছে" });
  } catch (error) {
    console.error("PRODUCT DELETE FAILED:", error);
    return NextResponse.json(
      { success: false, message: error?.message || String(error) },
      { status: 500 }
    );
  }
}
