import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import Category, { generateSlug } from "@/models/Category";

export const dynamic = "force-dynamic";

const DEPARTMENTS = ["beauty", "fashion", "tech"];

function serialize(category) {
  return {
    ...category,
    _id: category._id.toString(),
    department: category.department || "beauty",
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

/**
 * GET /api/categories
 *   ?dept=beauty|fashion|tech  → only categories for that department
 *   ?homeVisible=true          → homepage main categories (+ their children)
 */
export async function GET(request) {
  try {
    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const sp = request.nextUrl.searchParams;
    const wantHomeOnly = sp.get("homeVisible") === "true";
    const dept = (sp.get("dept") || "").trim().toLowerCase();

    const deptFilter = {};
    if (dept) {
      if (!DEPARTMENTS.includes(dept)) {
        return NextResponse.json(
          {
            success: false,
            message: "dept অবশ্যই beauty, fashion বা tech হতে হবে",
          },
          { status: 400 }
        );
      }
      deptFilter.department = dept;
    }

    let categories;

    if (wantHomeOnly) {
      const mains = await Category.find({
        isHomeVisible: true,
        parentCategory: null,
        ...deptFilter,
      })
        .sort({ createdAt: 1 })
        .lean();

      const mainIds = mains.map((m) => m._id);
      const children =
        mainIds.length > 0
          ? await Category.find({
              parentCategory: { $in: mainIds },
              ...deptFilter,
            })
              .sort({ createdAt: 1 })
              .lean()
          : [];

      categories = [...mains, ...children].map(serialize);
    } else {
      const all = await Category.find(deptFilter).sort({ createdAt: 1 }).lean();
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
      {
        success: false,
        message: "Could not load categories",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

async function parseCategoryExtras(body) {
  const errors = {};
  const values = {};

  values.isHomeVisible =
    body?.isHomeVisible === true || body?.isHomeVisible === "true";

  // Department (required for multi-department store)
  const department = String(body?.department || "beauty")
    .trim()
    .toLowerCase();
  if (!DEPARTMENTS.includes(department)) {
    errors.department = "department অবশ্যই beauty, fashion বা tech হতে হবে";
  } else {
    values.department = department;
  }

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
    } else {
      // Parent must be in the same department
      const parentDept = parentDoc.department || "beauty";
      if (values.department && parentDept !== values.department) {
        errors.parentCategory =
          "Parent category must belong to the same department";
      } else {
        values.parentCategory = parentDoc._id;
        // Sub-categories never show on homepage alone
        values.isHomeVisible = false;
        // Inherit department from parent if not explicitly set
        if (!body?.department) {
          values.department = parentDept;
        }
      }
    }
  }

  return Object.keys(errors).length > 0 ? { errors } : { values };
}

/**
 * POST /api/categories
 * Body: { name, slug?, icon?, department, parentCategory?, isHomeVisible? }
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    const name = (body?.name || "").trim();
    const icon = (body?.icon || "").trim() || "folder";
    let slug = (body?.slug || "").trim().toLowerCase();

    const errors = {};
    if (!name) errors.name = "Category name is required";
    if (!slug) slug = generateSlug(name);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.slug =
        "Slug may only contain lowercase letters, numbers, and dashes";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const extras = await parseCategoryExtras(body);
    if (extras.errors) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: extras.errors,
        },
        { status: 400 }
      );
    }

    const department = extras.values.department || "beauty";

    // Unique per department (same name/slug allowed in different depts)
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
              ? "এই department-এ এই নামের category আগে থেকেই আছে"
              : "এই department-এ এই slug আগে থেকেই আছে",
        },
        { status: 409 }
      );
    }

    const category = await Category.create({
      name,
      slug,
      icon,
      ...extras.values,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created",
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
        {
          success: false,
          message: error.message || "Could not save category",
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "এই department-এ এই নাম বা slug আগে থেকেই আছে",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Could not create category",
      },
      { status: 500 }
    );
  }
}
