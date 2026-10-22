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
const DEPARTMENTS = ["beauty", "fashion", "tech"];

function cleanStringList(value) {
  return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))].slice(0, 30);
}

function cleanSpecs(value) {
  const specs = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const label = String(item.label || "").trim().slice(0, 80);
    const specValue = String(item.value || "").trim().slice(0, 200);
    if (!label && !specValue) continue;
    if (!label || !specValue) return { error: "প্রতিটি স্পেকের label এবং value দুটোই লাগবে" };
    specs.push({ label, value: specValue });
  }
  return { specs: specs.slice(0, 40) };
}

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

  const data = {
    name,
    description,
    price,
    category,
    image,
    inStock,
    brand,
    isFeatured,
    isNew,
    isHotOffer,
    discountPrice,
  };

  // Optional on update so an older admin form does not wipe these fields.
  if (body?.department !== undefined && body?.department !== null && String(body.department).trim() !== "") {
    const department = String(body.department).trim().toLowerCase();
    if (!DEPARTMENTS.includes(department)) {
      errors.department = "department অবশ্যই beauty, fashion বা tech হতে হবে";
    } else {
      data.department = department;
    }
  }

  if (body?.sizes !== undefined) {
    if (!Array.isArray(body.sizes)) errors.sizes = "sizes অবশ্যই অ্যারে হতে হবে";
    else data.sizes = cleanStringList(body.sizes);
  }

  if (body?.colors !== undefined) {
    if (!Array.isArray(body.colors)) errors.colors = "colors অবশ্যই অ্যারে হতে হবে";
    else data.colors = cleanStringList(body.colors);
  }

  if (body?.specs !== undefined) {
    if (!Array.isArray(body.specs)) {
      errors.specs = "specs অবশ্যই {label, value} অ্যারে হতে হবে";
    } else {
      const parsed = cleanSpecs(body.specs);
      if (parsed.error) errors.specs = parsed.error;
      else data.specs = parsed.specs;
    }
  }

  if (Object.keys(errors).length > 0) return { errors };

  return { data };
}

function serialize(product) {
  const specs = Array.isArray(product.specs)
    ? product.specs.map((item) => ({
        label: item?.label || "",
        value: item?.value || "",
      }))
    : [];
  return {
    ...product,
    _id: product._id.toString(),
    department: product.department || "beauty",
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    specs,
    createdAt: product.createdAt ? product.createdAt.toISOString() : null,
  };
}

/** Backfill products saved before Phase 16 so ?dept=beauty still finds them. */
async function backfillDepartments() {
  const missing = await Product.countDocuments({
    $or: [{ department: { $exists: false } }, { department: null }, { department: "" }],
  });
  if (!missing) return;
  await Product.updateMany(
    { $or: [{ department: { $exists: false } }, { department: null }, { department: "" }] },
    { $set: { department: "beauty" } }
  );
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
 *   ?dept=beauty|fashion|tech          → department filter (omit to return all)
 *   ?sort=newest|price-asc|price-desc  (default: newest)
 */
export async function GET(request) {
  try {
    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    await backfillDepartments();

    const sp = request.nextUrl.searchParams;

    const filter = {};

    const dept = (sp.get("dept") || "").trim().toLowerCase();
    if (dept) {
      if (!DEPARTMENTS.includes(dept)) {
        return NextResponse.json(
          { success: false, message: "dept অবশ্যই beauty, fashion বা tech হতে হবে" },
          { status: 400 }
        );
      }
      filter.department = dept;
    }

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

    // ---- featured & hotOffer (supports both true and false values) ----
    const featuredParam = sp.get("featured");
    if (featuredParam === "true") filter.isFeatured = true;
    else if (featuredParam === "false") filter.isFeatured = false;

    // Phase 7.6: hot-offer filter for the homepage "হট অফার" section
    const hotOfferParam = sp.get("hotOffer");
    if (hotOfferParam === "true") filter.isHotOffer = true;
    else if (hotOfferParam === "false") filter.isHotOffer = false;

    // Phase 7.7: ?inStock=true → only products currently in stock
    if (sp.get("inStock") === "true") filter.inStock = true;

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

    // ---- text search (?q= or ?search=) on name + description ----
    const term = (sp.get("q") || sp.get("search") || "").trim().slice(0, 80);
    if (term) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    // ---- price range (numbers only; inclusive). Compared to the sale price. ----
    const minPrice = Number(sp.get("minPrice"));
    const maxPrice = Number(sp.get("maxPrice"));
    const hasMin = sp.get("minPrice") != null && sp.get("minPrice") !== "" && Number.isFinite(minPrice);
    const hasMax = sp.get("maxPrice") != null && sp.get("maxPrice") !== "" && Number.isFinite(maxPrice);

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
      // $$p was never defined, so every price filter matched nothing.
      // Compare the numeric sale price (discountPrice, else price).
      const priceChecks = [];
      if (hasMin) priceChecks.push({ $gte: ["$effectivePrice", minPrice] });
      if (hasMax) priceChecks.push({ $lte: ["$effectivePrice", maxPrice] });

      const pipeline = [
        { $match: filter },
        {
          $addFields: {
            effectivePrice: {
              $convert: {
                input: { $ifNull: ["$discountPrice", "$price"] },
                to: "double",
                onError: null,
                onNull: null,
              },
            },
          },
        },
        {
          $match: {
            $expr: priceChecks.length === 1 ? priceChecks[0] : { $and: priceChecks },
          },
        },
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
    if (!data.department) data.department = "beauty";

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
