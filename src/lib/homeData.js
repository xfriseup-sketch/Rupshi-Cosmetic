import dbConnect from "@/lib/mongodb";
import SiteSettings, { DEFAULT_SETTINGS } from "@/models/SiteSettings";
import Category from "@/models/Category";
import Product from "@/models/Product";

/** Deep-merge settings so partial DB docs never lose nested defaults. */
function mergeSettings(dbSettings) {
  if (!dbSettings || typeof dbSettings !== "object") {
    return structuredClone(DEFAULT_SETTINGS);
  }
  const out = structuredClone(DEFAULT_SETTINGS);
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (dbSettings[key] != null && typeof dbSettings[key] === "object") {
      out[key] = { ...out[key], ...dbSettings[key] };
    }
  }
  return out;
}

async function loadSettings() {
  try {
    const conn = await dbConnect();
    if (!conn) return mergeSettings(null);

    let doc = await SiteSettings.findOne({ key: "global" }).lean();
    if (!doc) {
      const created = await SiteSettings.create({
        key: "global",
        ...DEFAULT_SETTINGS,
      });
      doc = created.toObject();
    }
    const { _id, __v, key, createdAt, updatedAt, ...rest } = doc;
    return mergeSettings(rest);
  } catch (err) {
    console.error("[homeData] settings error:", err?.message);
    return mergeSettings(null);
  }
}

async function loadHomeCategories(maxItems = 4) {
  try {
    const conn = await dbConnect();
    if (!conn) return [];

    const mains = await Category.find({
      isHomeVisible: true,
      $or: [{ parentCategory: null }, { parentCategory: { $exists: false } }],
    })
      .sort({ createdAt: 1 })
      .limit(Math.min(Math.max(1, maxItems), 12))
      .lean();

    const mainIds = mains.map((m) => m._id);
    const children =
      mainIds.length > 0
        ? await Category.find({ parentCategory: { $in: mainIds } })
            .sort({ createdAt: 1 })
            .lean()
        : [];

    const childCountByParent = new Map();
    for (const c of children) {
      const pid = String(c.parentCategory);
      childCountByParent.set(pid, (childCountByParent.get(pid) || 0) + 1);
    }

    return mains.map((c) => ({
      name: c.name,
      slug: c.slug || c.name,
      icon: c.icon && c.icon !== "folder" && c.icon !== "🛍️" ? c.icon : "",
      count: childCountByParent.get(String(c._id)) || 0,
    }));
  } catch (err) {
    console.error("[homeData] categories error:", err?.message);
    return [];
  }
}

function serializeProduct(p) {
  return {
    ...p,
    _id: p._id.toString(),
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
  };
}

async function loadProducts({ filter = {}, limit = 4 } = {}) {
  try {
    const conn = await dbConnect();
    if (!conn) return [];

    const cap = Math.min(Math.max(1, limit), 50);
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(cap)
      .lean();

    return products.map(serializeProduct);
  } catch (err) {
    console.error("[homeData] products error:", err?.message);
    return [];
  }
}

/**
 * Load everything the homepage needs in one place.
 * Bypasses HTTP self-fetch which often fails on Vercel serverless.
 */
export async function getHomePageData() {
  const settings = await loadSettings();

  const catLimit = settings.categoriesSection?.maxItems ?? 4;
  const featuredLimit = settings.bestSellersSection?.maxItems ?? 4;
  const hotLimit = settings.hotOffersSection?.maxItems ?? 3;
  const newLimit = settings.newArrivalsSection?.maxItems ?? 4;

  const [categories, bestSellers, hotOffers, newArrivals] = await Promise.all([
    loadHomeCategories(catLimit),
    loadProducts({ filter: { isFeatured: true }, limit: featuredLimit }),
    loadProducts({ filter: { isHotOffer: true }, limit: hotLimit }),
    loadProducts({ filter: {}, limit: newLimit }),
  ]);

  return {
    settings,
    categories,
    bestSellers,
    hotOffers,
    newArrivals,
  };
}
