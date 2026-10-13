import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

// Products come from MongoDB and change frequently — always fetch fresh data
export const dynamic = "force-dynamic";

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
