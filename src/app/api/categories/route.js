import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import Category, { generateSlug, CATEGORY_DEPARTMENTS } from "@/models/Category";

export const dynamic = "force-dynamic";

function cleanIcon(value) {
  const icon = String(value || "").trim();
  return icon === "folder" ? "" : icon;
}

function normalizeDepartment(value) {
  const department = String(value || "beauty").trim().toLowerCase();
  return CATEGORY_DEPARTMENTS.includes(department) ? department : "";
}

function serialize(category) {
  return {
    ...category,
    _id: category._id.toString(),
    department: category.department || "beauty",
    icon: cleanIcon(category.icon),
    parentCategory: category.parentCategory
      ? category.parentCategory.toString()
      : null,
    createdAt: category.createdAt ? category.createdAt.toISOString() : null,
  };
}

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

/** Old categories have no department. Treat them as beauty and drop single-field unique indexes. */
async function prepareCategories() {
  await Category.updateMany(
    { $or: [{ department: { $exists: false } }, { department: null }, { department: "" }] },
    { $set: { department: "beauty" } }
  );

  try {
    const indexes = await Category.collection.indexes();
    for (const idx of indexes) {
      const keys = Object.keys(idx.key || {});
      if (idx.unique && keys.length === 1 && (keys[0] === "name" || keys[0] === "slug")) {
        await Category.collection.dropIndex(idx.name);
      }
    }
    await Category.collection.createIndex({ name: 1, department: 1 }, { unique: true });
    await Category.collection.createIndex({ slug: 1, department: 1 }, { unique: true });
  } catch (error) {
    console.warn("Category index migration:", error.message);
  }
}

export async function GET(request) {
  try {
    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    await prepareCategories();

    const wantHomeOnly = request.nextUrl.searchParams.get("homeVisible") === "true";
    const deptRaw = (request.nextUrl.searchParams.get("dept") || "").trim().toLowerCase();
    const dept = CATEGORY_DEPARTMENTS.includes(deptRaw) ? deptRaw : "";

    const query = {};
    if (dept) query.department = dept;
    if (wantHomeOnly) {
      query.isHomeVisible = true;
      query.parentCategory = null;
    }

    let categories;
    if (wantHomeOnly) {
      const mains = await Category.find(query).sort({ createdAt: 1 }).lean();
      const mainIds = mains.map((m) => m._id);
      const childQuery = { parentCategory: { $in: mainIds } };
      if (dept) childQuery.department = dept;
      const children =
        mainIds.length > 0
          ? await Category.find(childQuery).sort({ createdAt: 1 }).lean()
          : [];
      categories = [...mains, ...children].map(serialize);
    } else {
      const all = await Category.find(query).sort({ createdAt: 1 }).lean();
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
      { success: false, message: "Could not load categories", error: error.message },
      { status: 500 }
    );
  }
}

async function parseCategoryExtras(body, department) {
  const errors = {};
  const values = {};

  values.isHomeVisible = body?.isHomeVisible === true || body?.isHomeVisible === "true";

  const parent = body?.parentCategory;
  if (!parent || parent === "null" || parent === "") {
    values.parentCategory = null;
  } else if (!mongoose.Types.ObjectId.isValid(parent)) {
    errors.parentCategory = "Invalid parent category";
  } else {
    const parentDoc = await Category.findById(parent).lean();
    if (!parentDoc) {
      errors.parentCategory = "Parent category not found";
    } else if (parentDoc.parentCategory) {
      errors.parentCategory = "Cannot nest under a sub-category";
    } else if ((parentDoc.department || "beauty") !== department) {
      errors.parentCategory = "Parent category must be in the same department";
    } else {
      values.parentCategory = parentDoc._id;
      values.isHomeVisible = false;
    }
  }

  return Object.keys(errors).length > 0 ? { errors } : { values };
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    const name = (body?.name || "").trim();
    const icon = cleanIcon(body?.icon);
    let slug = (body?.slug || "").trim().toLowerCase();
    const department = normalizeDepartment(body?.department || "beauty");

    const errors = {};
    if (!name) errors.name = "Category name is required";
    if (!department) errors.department = "Department must be beauty, fashion, or tech";
    if (!slug) slug = generateSlug(name);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.slug = "Slug may only contain lowercase letters, numbers, and dashes";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();
    await prepareCategories();

    const extras = await parseCategoryExtras(body, department);
    if (extras.errors) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: extras.errors },
        { status: 400 }
      );
    }

    const existing = await Category.findOne({
      department,
      $or: [{ name }, { slug }],
    }).lean();
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            existing.name === name
              ? "A category with this name already exists in this department"
              : "A category with this slug already exists in this department",
        },
        { status: 409 }
      );
    }

    const category = await Category.create({
      name,
      slug,
      icon,
      department,
      ...extras.values,
    });

    return NextResponse.json(
      { success: true, message: "Category created", category: serialize(category.toObject()) },
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
        { success: false, message: error.message || "Could not save category", errors: fieldErrors },
        { status: 400 }
      );
    }

    if (error?.code === 11000) {
      return NextResponse.json(
        { success: false, message: "A category with this name or slug already exists in this department" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: error?.message || "Could not create category" },
      { status: 500 }
    );
  }
}
