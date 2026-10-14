import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import Category, { generateSlug } from "@/models/Category";

export const dynamic = "force-dynamic";

function serialize(category) {
  return {
    ...category,
    _id: category._id.toString(),
    createdAt: category.createdAt ? category.createdAt.toISOString() : null,
  };
}

/**
 * PUT /api/categories/[id]
 * Updates an existing category. Body: { name?, slug?, icon? }
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "অবৈধ ক্যাটেগরি আইডি" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);

    const name = (body?.name || "").trim();
    const icon = (body?.icon || "").trim() || "🛍️";
    let slug = (body?.slug || "").trim().toLowerCase();

    const errors = {};
    if (!name) errors.name = "ক্যাটেগরির নাম আবশ্যক";
    if (!slug) slug = generateSlug(name);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.slug = "Slug-এ শুধু ছোট হাতের অক্ষর, সংখ্যা ও ড্যাশ ব্যবহার করুন";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "ক্যাটেগরি তথ্যে সমস্যা আছে", errors },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    // Duplicate check excluding the current document
    const duplicate = await Category.findOne({
      _id: { $ne: id },
      $or: [{ name }, { slug }],
    }).lean();
    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "এই নাম বা slug দিয়ে অন্য একটি ক্যাটেগরি আছে" },
        { status: 409 }
      );
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name, slug, icon },
      { new: true, runValidators: true }
    ).lean();

    if (!category) {
      return NextResponse.json(
        { success: false, message: "ক্যাটেগরি পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "ক্যাটেগরি আপডেট হয়েছে",
      category: serialize(category),
    });
  } catch (error) {
    console.error("Error updating category:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      const fieldErrors = {};
      for (const [field, err] of Object.entries(error.errors)) {
        fieldErrors[field] = err.message;
      }
      return NextResponse.json(
        { success: false, message: "ক্যাটেগরি সেভ করা যায়নি", errors: fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "ক্যাটেগরি আপডেট করা যায়নি" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 * Removes a category. Refuses to delete a category that still has products.
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "অবৈধ ক্যাটেগরি আইডি" },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const category = await Category.findById(id).lean();
    if (!category) {
      return NextResponse.json(
        { success: false, message: "ক্যাটেগরি পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // Guard against orphaning products that belong to this category
    const { default: Product } = await import("@/models/Product");
    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `এই ক্যাটেগরিতে ${productCount}টি প্রোডাক্ট আছে — আগে প্রোডাক্টগুলো সরান বা মুছুন`,
        },
        { status: 409 }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "ক্যাটেগরি মুছে ফেলা হয়েছে",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, message: "ক্যাটেগরি মুছে ফেলা যায়নি" },
      { status: 500 }
    );
  }
}
