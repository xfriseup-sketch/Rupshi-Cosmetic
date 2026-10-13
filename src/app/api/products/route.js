import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

// Products come from MongoDB and change frequently — always fetch fresh data
export const dynamic = "force-dynamic";

const CATEGORIES = ["Skincare", "Makeup", "Haircare", "Fragrance"];

/**
 * Validate + normalize a product payload coming from POST/PUT requests.
 * Returns { data } on success or { errors } object on failure.
 */
function parseProductPayload(body) {
  const errors = {};

  const name = (body?.name || "").trim();
  const description = (body?.description || "").trim();
  const price = Number(body?.price);
  const category = (body?.category || "").trim();
  const image = (body?.image || "").trim();
  const inStock = Boolean(body?.inStock);

  if (!name) errors.name = "প্রোডাক্টের নাম আবশ্যক";
  if (body?.price === undefined || body?.price === "" || Number.isNaN(price) || price < 0) {
    errors.price = "সঠিক দাম দিন";
  }
  if (!CATEGORIES.includes(category)) {
    errors.category = "সঠিক ক্যাটাগরি নির্বাচন করুন";
  }
  if (!image || !/^https?:\/\/.+/i.test(image)) {
    errors.image = "সঠিক ইমেজ URL দিন (http:// বা https:// দিয়ে শুরু)";
  }

  if (Object.keys(errors).length > 0) return { errors };

  return { data: { name, description, price, category, image, inStock } };
}

function serialize(product) {
  return {
    ...product,
    _id: product._id.toString(),
    createdAt: product.createdAt ? product.createdAt.toISOString() : null,
  };
}

/**
 * GET /api/products
 * Fetches all products from MongoDB and returns them as JSON.
 */
export async function GET() {
  try {
    await dbConnect();

    const products = await Product.find({}).sort({ createdAt: -1 }).lean();

    // Convert ObjectId / Date instances to plain strings for JSON response
    const serializedProducts = products.map((product) => ({
      ...product,
      _id: product._id.toString(),
      createdAt: product.createdAt ? product.createdAt.toISOString() : null,
    }));

    return NextResponse.json({
      success: true,
      count: serializedProducts.length,
      products: serializedProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, message: "প্রোডাক্ট লোড করা যায়নি", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Creates a new product (used by the admin panel).
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const { data, errors } = parseProductPayload(body);

    if (errors) {
      return NextResponse.json(
        { success: false, message: "প্রোডাক্ট তথ্যে সমস্যা আছে", errors },
        { status: 400 }
      );
    }

    await dbConnect();

    const product = await Product.create(data);

    // .toObject() gives a plain object (a raw Mongoose doc is not JSON-serializable)
    return NextResponse.json(
      { success: true, message: "নতুন প্রোডাক্ট যোগ হয়েছে", product: serialize(product.toObject()) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      const fieldErrors = {};
      for (const [field, err] of Object.entries(error.errors)) {
        fieldErrors[field] = err.message;
      }
      return NextResponse.json(
        { success: false, message: "প্রোডাক্ট সেভ করা যায়নি", errors: fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "প্রোডাক্ট তৈরি করা যায়নি" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products?id=<productId>
 * Updates an existing product (used by the admin edit modal).
 */
export async function PUT(request) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "অবৈধ প্রোডাক্ট আইডি" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    const { data, errors } = parseProductPayload(body);

    if (errors) {
      return NextResponse.json(
        { success: false, message: "প্রোডাক্ট তথ্যে সমস্যা আছে", errors },
        { status: 400 }
      );
    }

    await dbConnect();

    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "প্রোডাক্ট পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "প্রোডাক্ট আপডেট হয়েছে",
      product: serialize(product),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, message: "প্রোডাক্ট আপডেট করা যায়নি" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products?id=<productId>
 * Removes a product (used by the admin delete confirmation).
 */
export async function DELETE(request) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "অবৈধ প্রোডাক্ট আইডি" },
        { status: 400 }
      );
    }

    await dbConnect();

    const product = await Product.findByIdAndDelete(id).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "প্রোডাক্ট পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "প্রোডাক্ট মুছে ফেলা হয়েছে",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, message: "প্রোডাক্ট মুছে ফেলা যায়নি" },
      { status: 500 }
    );
  }
}
