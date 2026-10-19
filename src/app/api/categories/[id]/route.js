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
 */
export async function PUT(request, context) {
  try {
    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid category ID" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);

    const name = (body?.name || "").trim();
    const icon = (body?.icon || "").trim() || "folder";
    let slug = (body?.slug || "").trim().toLowerCase();

    const errors = {};
    if (!name) errors.name = "Category name is required";
    if (!slug) slug = generateSlug(name);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.slug = "Slug may only contain lowercase letters, numbers, and dashes";
    }

    const isHomeVisible = body?.isHomeVisible === true || body?.isHomeVisible === "true";
    let parentCategory = null;
    const parentRaw = body?.parentCategory;
    if (parentRaw && parentRaw !== "null" && parentRaw !== "") {
      if (!mongoose.Types.ObjectId.isValid(parentRaw)) {
        errors.parentCategory = "Invalid parent category";
      } else if (parentRaw === id) {
        errors.parentCategory = "A category cannot be its own parent";
      } else {
        const parentDoc = await Category.findById(parentRaw).lean();
        if (!parentDoc) {
          errors.parentCategory = "Parent category not found";
        } else if (parentDoc.parentCategory) {
          errors.parentCategory = "Cannot nest under a sub-category";
        } else {
          parentCategory = parentDoc._id;
        }
      }
    }

    if (!errors.parentCategory && parentCategory) {
      const childCount = await Category.countDocuments({ parentCategory: id });
      if (childCount > 0) {
        errors.parentCategory = `This category has ${childCount} sub-categories and cannot become a sub-category itself`;
      }
    }

    const finalHomeVisible = parentCategory ? false : isHomeVisible;

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const duplicate = await Category.findOne({
      _id: { $ne: id },
      $or: [{ name }, { slug }],
    }).lean();
    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "Another category already uses this name or slug" },
        { status: 409 }
      );
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name, slug, icon, parentCategory, isHomeVisible: finalHomeVisible },
      { new: true, runValidators: true }
    ).lean();

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category updated",
      category: serialize(category),
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Could not update category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 */
export async function DELETE(request, context) {
  try {
    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid category ID" },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const category = await Category.findById(id).lean();
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    const childCount = await Category.countDocuments({ parentCategory: id });
    if (childCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `This category has ${childCount} sub-categories. Delete them first.`,
        },
        { status: 409 }
      );
    }

    const { default: Product } = await import("@/models/Product");
    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `This category has ${productCount} products. Move or delete them first.`,
        },
        { status: 409 }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Category deleted",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, message: "Could not delete category" },
      { status: 500 }
    );
  }
}
