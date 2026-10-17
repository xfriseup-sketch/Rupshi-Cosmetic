import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import Product, { ensureUniqueSlug } from "@/models/Product";
import Category from "@/models/Category";

// Products come from MongoDB and change frequently — always fetch fresh data
export const dynamic = "force-dynamic";

// Default categories — used only as a fallback when the database is not
// configured. Real category lists are managed dynamically via /api/categories.
const DEFAULT_CATEGORIES = ["Skincare", "Makeup", "Haircare", "Fragrance"];

/**
 * Validate + normalize a product payload coming from POST/PUT requests.
 * Returns { data } on success or { errors } object on failure.
 */
async function parseProductPayload(body) {
  const errors = {};

  const name = (body?.name || "").trim();
  const description = (body?.description || "").trim();
  const price = Number(body?.price);
  const category = (body?.category || "").trim();
  const image = (body?.image || "").trim();
  const inStock = Boolean(body?.inStock);
  const brand = (body?.brand || "").trim();

  // Phase 6 flags
  const isFeatured = Boolean(body?.isFeatured);
  const isNew = Boolean(body?.isNew);
  // Phase 7.6 — "হট অফার" homepage section flag
  const isHotOffer = Boolean(body?.isHotOffer);
  let discountPrice = null;
  if (body?.discountPrice !== undefined && body?.discountPrice !== null && body?.discountPrice !== "") {
    discountPrice = Number(body.discountPrice);
  }

  if (!name) errors.name = "প্রোডাক্টের নাম আবশ্যক";
  if (body?.price === undefined || body?.price === "" || Number.isNaN(price) || price < 0) {
    errors.price = "সঠিক দাম দিন";
  }
  if (!brand) errors.brand = "ব্র্যান্ড আবশ্যক";
  if (discountPrice !== null) {
    if (Number.isNaN(discountPrice) || discountPrice < 0) {
      errors.discountPrice = "সঠিক ডিসকাউন্ট দাম দিন";
    } else if (!Number.isNaN(price) && discountPrice >= price) {
      errors.discountPrice = "ডিসকাউন্ট দাম মূল দামের চেয়ে কম হতে হবে";
    }
  }

  // Category must exist in the dynamic category list (falls back to the
  // defaults when MongoDB is not configured, so validation never crashes).
  let allowedCategories = DEFAULT_CATEGORIES;
  try {
    const conn = await dbConnect();
    if (conn) {
      const cats = await Category.find({}).select("name").lean();
      if (cats.length > 0) allowedCategories = cats.map((c) => c.name);
    }
  } catch (e) {
    console.warn("Could not load categories for validation:", e.message);
  }

  if (!category) {
    errors.category = "ক্যাটাগরি নির্বাচন করুন";
  } else if (!allowedCategories.includes(category)) {
    errors.category = "সঠিক ক্যাটাগরি নির্বাচন করুন";
  }
  if (!image || !/^https?:\/\/.+/i.test(image)) {
    errors.image = "সঠিক ইমেজ URL দিন (http:// বা https:// দিয়ে শুরু)";
  }

  if (Object.keys(errors).length > 0) return { errors };

  return {
    data: { name, description, price, category, image, inStock, brand, isFeatured, isNew, isHotOffer, discountPrice },
  };
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
 * Fetches products from MongoDB with Phase 6 filtering support:
 *   ?featured=true        → only isFeatured products (homepage section)
 *   ?hotOffer=true        → only isHotOffer products (Phase 7.6 homepage section)
 *   ?limit=N              → cap result count (default: all, max 50)
 *   ?brand=X              → single brand or comma-separated brands
 *   ?minPrice=Y&maxPrice=Z→ effective price range (uses discountPrice when set)
 *   ?category=slug-or-name→ category incl. sub-categories (children included)
 *   ?sort=newest|price-asc|price-desc  (default: newest)
 */
export async function GET(request) {
  try {
    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const sp = request.nextUrl.searchParams;

    const filter = {};

    // ---- single product lookup by ?slug= or ?id= (product detail page) ----
    const slugParam = sp.get("slug");
    const idParam = sp.get("id");
    if (slugParam) filter.slug = slugParam.toLowerCase();
    else if (idParam) {
      if (!mongoose.Types.ObjectId.isValid(idParam)) {
        return NextResponse.json(
          { success: false, message: "অবৈধ প্রোডাক্ট আইডি" },
          { status: 400 }
        );
      }
      filter._id = idParam;
    }

    // ---- featured & limit ----
    if (sp.get("featured") === "true") filter.isFeatured = true;
    // Phase 7.6: hot-offer filter for the homepage "হট অফার" section
    if (sp.get("hotOffer") === "true") filter.isHotOffer = true;

    let limit = parseInt(sp.get("limit") || "0", 10);
    if (!Number.isFinite(limit) || limit <= 0) limit = 200;
    limit = Math.min(limit, 50);

    // ---- brand (comma-separated list supported) ----
    const brandParam = sp.get("brand");
    if (brandParam) {
      const brands = brandParam.split(",").map((b) => b.trim()).filter(Boolean);
      if (brands.length === 1) filter.brand = brands[0];
      else if (brands.length > 1) filter.brand = { $in: brands };
    }

    // ---- price range (against effective price: discountPrice ?? price) ----
    const minPrice = parseFloat(sp.get("minPrice") || "");
    const maxPrice = parseFloat(sp.get("maxPrice") || "");
    const hasMin = Number.isFinite(minPrice);
    const hasMax = Number.isFinite(maxPrice);

    // ---- category slug/name → include sub-categories too ----
    const categoryParam = sp.get("category");
    if (categoryParam) {
      const catDoc = await Category.findOne({
        $or: [
          { slug: categoryParam.toLowerCase() },
          { name: categoryParam },
        ],
      }).lean();

      if (catDoc) {
        // A real category document: match it + any children (sub-categories)
        const children = await Category.find({ parentCategory: catDoc._id })
          .select("name")
          .lean();
        const names = [catDoc.name, ...children.map((c) => c.name)];
        filter.category = { $in: names };
      } else {
        // Fall back to plain name match (legacy data / default categories)
        filter.category = categoryParam;
      }
    }

    // ---- sorting ----
    const sortParam = sp.get("sort"); // newest | price-asc | price-desc (default newest)

    let products;
    if (hasMin || hasMax) {
      // Aggregation lets us filter by the *effective* (discounted) price
      const conditions = [];
      if (hasMin) conditions.push({ $gte: ["$$p", minPrice] });
      if (hasMax) conditions.push({ $lte: ["$$p", maxPrice] });

      const pipeline = [
        { $match: filter },
        { $addFields: { effectivePrice: { $ifNull: ["$discountPrice", "$price"] } } },
        { $match: { $expr: { $and: conditions } } },
      ];
      if (sortParam === "price-asc") pipeline.push({ $sort: { effectivePrice: 1, createdAt: -1 } });
      else if (sortParam === "price-desc") pipeline.push({ $sort: { effectivePrice: -1, createdAt: -1 } });
      else pipeline.push({ $sort: { createdAt: -1 } });
      pipeline.push({ $limit: limit });

      products = await Product.aggregate(pipeline);
    } else {
      // No price filter — regular query; sort by discounted price in memory
      // so the effective (sale) price is respected.
      const all = await Product.find(filter).lean();
      if (sortParam === "price-asc" || sortParam === "price-desc") {
        all.sort((a, b) => {
          const pa = a.discountPrice ?? a.price;
          const pb = b.discountPrice ?? b.price;
          return sortParam === "price-asc" ? pa - pb : pb - pa;
        });
      } else {
        all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      products = all.slice(0, limit);
    }

    const serializedProducts = products.map(serialize);

    return NextResponse.json({
      success: true,
      count: serializedProducts.length,
      products: serializedProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "প্রোডাক্ট লোড করা যায়নি", error: error.message },
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
    const { data, errors } = await parseProductPayload(body);

    if (errors) {
      return NextResponse.json(
        { success: false, message: "প্রোডাক্ট তথ্যে সমস্যা আছে", errors },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    // Auto-generate a unique URL slug from the name (Phase 7)
    data.slug = await ensureUniqueSlug(Product, null, data.name);

    const product = await Product.create(data);

    // .toObject() gives a plain object (a raw Mongoose doc is not JSON-serializable)
    return NextResponse.json(
      { success: true, message: "নতুন প্রোডাক্ট যোগ হয়েছে", product: serialize(product.toObject()) },
      { status: 201 }
    );
  } catch (error) {
    // Full raw error in Vercel / server logs for debugging
    console.error("PRODUCT SAVE FAILED:", error);

    // Capture the EXACT error message so it can be shown on screen
    const exactMessage =
      error?.message ||
      (typeof error === "string" ? error : "") ||
      String(error);

    if (error instanceof mongoose.Error.ValidationError) {
      const fieldErrors = {};
      for (const [field, err] of Object.entries(error.errors)) {
        fieldErrors[field] = err.message;
      }
      // Raw mongoose message surfaced directly (no generic fallback)
      return NextResponse.json(
        { success: false, message: exactMessage, errors: fieldErrors },
        { status: 400 }
      );
    }

    // DEBUG MODE: return the raw server error message to the client
    return NextResponse.json(
      { success: false, message: exactMessage },
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
    const { data, errors } = await parseProductPayload(body);

    if (errors) {
      return NextResponse.json(
        { success: false, message: "প্রোডাক্ট তথ্যে সমস্যা আছে", errors },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    // Regenerate slug if the name changed or the product has none yet (Phase 7)
    const existing = await Product.findById(id).select("name slug").lean();
    if (existing && (!existing.slug || existing.name !== data.name)) {
      data.slug = await ensureUniqueSlug(Product, id, data.name);
    }

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
      { success: false, message: error?.message || "প্রোডাক্ট আপডেট করা যায়নি" },
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

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

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
      { success: false, message: error?.message || "প্রোডাক্ট মুছে ফেলা যায়নি" },
      { status: 500 }
    );
  }
}
