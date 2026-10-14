import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import Category, { generateSlug } from "@/models/Category";

// Categories come from MongoDB and can change via the admin panel
export const dynamic = "force-dynamic";

function serialize(category) {
  return {
    ...category,
    _id: category._id.toString(),
    createdAt: category.createdAt ? category.createdAt.toISOString() : null,
  };
}

/**
 * GET /api/categories
 * Fetches all categories (sorted by creation date).
 */
export async function GET() {
  try {
    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const categories = await Category.find({}).sort({ createdAt: 1 }).lean();

    return NextResponse.json({
      success: true,
      count: categories.length,
      categories: categories.map(serialize),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "ক্যাটেগরি লোড করা যায়নি", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Creates a new category (used by the admin panel).
 * Body: { name, slug?, icon? }
 */
export async function POST(request) {
  try {
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

    // Friendly duplicate check before hitting the unique index
    const existing = await Category.findOne({ $or: [{ name }, { slug }] }).lean();
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            existing.name === name
              ? "এই নামে ক্যাটেগরি আগে থেকেই আছে"
              : "এই slug দিয়ে ক্যাটেগরি আগে থেকেই আছে",
        },
        { status: 409 }
      );
    }

    const category = await Category.create({ name, slug, icon });

    return NextResponse.json(
      {
        success: true,
        message: "নতুন ক্যাটেগরি যোগ হয়েছে",
        category: serialize(category.toObject()),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);

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

    if (error?.code === 11000) {
      return NextResponse.json(
        { success: false, message: "এই নাম বা slug দিয়ে ক্যাটেগরি আগে থেকেই আছে" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "ক্যাটেগরি তৈরি করা যায়নি" },
      { status: 500 }
    );
  }
}
