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
 * Build a nested tree from a flat category list:
 * [{ ...main, children: [{ ...sub }, ...] }, ...]
 * Orphaned children (parent deleted) are surfaced as top-level items.
 */
function nestCategories(flat) {
  const byId = new Map(flat.map((c) => [c._id, { ...c, children: [] }]));
  const roots = [];
  for (const node of byId.values()) {
    const parentId = node.parentCategory ? String(node.parentCategory) : null;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId).children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

/**
 * GET /api/categories
 * Fetches all categories (sorted by creation date).
 *   ?homeVisible=true → only MAIN categories flagged isHomeVisible, returned
 *                        in nested form: [{ name: "Skincare", children: [...] }]
 * Without the flag, returns the full nested tree as well (flat fields kept on
 * each node so admin tables can still render them).
 */
export async function GET(request) {
  try {
    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const wantHomeOnly = request.nextUrl.searchParams.get("homeVisible") === "true";

    let categories;
    if (wantHomeOnly) {
      // Home-visible main categories + their children
      const mains = await Category.find({ isHomeVisible: true, parentCategory: null })
        .sort({ createdAt: 1 })
        .lean();
      const mainIds = mains.map((m) => m._id);
      const children =
        mainIds.length > 0
          ? await Category.find({ parentCategory: { $in: mainIds } })
              .sort({ createdAt: 1 })
              .lean()
          : [];
      categories = [...mains, ...children].map(serialize);
    } else {
      const all = await Category.find({}).sort({ createdAt: 1 }).lean();
      categories = all.map(serialize);
    }

    return NextResponse.json({
      success: true,
      count: categories.length,
      categories,
      tree: nestCategories(categories),
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
 * Validate optional Phase 6 category fields (parentCategory / isHomeVisible).
 * Returns { values } or { errors }.
 */
async function parseCategoryExtras(body) {
  const errors = {};
  const values = {};

  // isHomeVisible — checkbox may arrive as boolean or string
  values.isHomeVisible =
    body?.isHomeVisible === true || body?.isHomeVisible === "true";

  // parentCategory — "" / null means "main category"
  const parent = body?.parentCategory;
  if (!parent || parent === "null" || parent === "") {
    values.parentCategory = null;
  } else if (!mongoose.Types.ObjectId.isValid(parent)) {
    errors.parentCategory = "অবৈধ প্যারেন্ট ক্যাটাগরি";
  } else {
    const parentDoc = await Category.findById(parent).lean();
    if (!parentDoc) {
      errors.parentCategory = "প্যারেন্ট ক্যাটাগরি পাওয়া যায়নি";
    } else if (parentDoc.parentCategory) {
      // Keep it simple: only two levels (main → sub)
      errors.parentCategory = "সাব-ক্যাটাগরির নিচে আর সাব-ক্যাটাগরি রাখা যাবে না";
    } else {
      values.parentCategory = parentDoc._id;
      // Sub-categories are never shown directly on the homepage grid
      values.isHomeVisible = false;
    }
  }

  return Object.keys(errors).length > 0 ? { errors } : { values };
}

/**
 * POST /api/categories
 * Creates a new category (used by the admin panel).
 * Body: { name, slug?, icon?, parentCategory?, isHomeVisible? }
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

    const extras = await parseCategoryExtras(body);
    if (extras.errors) {
      return NextResponse.json(
        { success: false, message: "ক্যাটেগরি তথ্যে সমস্যা আছে", errors: extras.errors },
        { status: 400 }
      );
    }

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

    const category = await Category.create({ name, slug, icon, ...extras.values });

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
        { success: false, message: error.message || "ক্যাটেগরি সেভ করা যায়নি", errors: fieldErrors },
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
      { success: false, message: error?.message || "ক্যাটেগরি তৈরি করা যায়নি" },
      { status: 500 }
    );
  }
}
