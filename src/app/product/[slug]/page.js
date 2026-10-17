import Image from "next/image";
import Link from "next/link";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductActions from "./ProductActions";

export const dynamic = "force-dynamic";

/**
 * GET /product/[slug]
 * Single product detail page (Phase 7).
 * Next.js 14: `params` is a Promise — it MUST be awaited.
 * Fallback: if the slug doesn't match any product but IS a valid ObjectId,
 * we look the product up by _id (legacy products created before slugs existed).
 */
export default async function ProductPage({ params }) {
  const { slug } = await params;

  let product = null;
  let related = [];
  let dbOk = false;

  try {
    const conn = await dbConnect();
    if (conn) {
      dbOk = true;

      // 1) find by slug
      product = await Product.findOne({ slug: decodeURIComponent(slug) }).lean();

      // 2) fallback: legacy products without slug — treat param as ObjectId
      if (!product && mongoose.Types.ObjectId.isValid(slug)) {
        product = await Product.findById(slug).lean();
      }

      // 3) last resort: match on name (older data may store Bengali names raw)
      if (!product) {
        product = await Product.findOne({ name: decodeURIComponent(slug) }).lean();
      }

      // Related products: same category, excluding current one
      if (product) {
        const found = await Product.find({
          category: product.category,
          _id: { $ne: product._id },
        })
          .limit(8)
          .lean();
        // pick up to 4 at random
        related = found.sort(() => 0.5 - Math.random()).slice(0, 4);
      }
    }
  } catch (error) {
    console.error("PRODUCT PAGE LOAD FAILED:", error);
  }

  // ---------- DB not configured ----------
  if (!dbOk) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-5xl">🗄️</p>
        <h1 className="mt-4 text-xl font-bold text-gray-800">
          ডাটাবেস কনফিগার করা হয়নি
        </h1>
        <p className="mt-2 text-gray-500">
          দয়া করে MONGODB_URI সেট করে আবার চেষ্টা করুন।
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-[#ec4899] px-8 py-3 font-semibold text-white transition hover:scale-105"
        >
          দোকানে ফিরে যান
        </Link>
      </main>
    );
  }

  // ---------- product not found ----------
  if (!product) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-6xl">🔍</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-800">
          প্রোডাক্টটি খুঁজে পাওয়া যায়নি
        </h1>
        <p className="mt-2 text-gray-500">
          সম্ভবত এই পণ্যটি আর নেই বা ঠিকানাটি ভুল।
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-[#ec4899] px-8 py-3 font-semibold text-white transition hover:scale-105"
        >
          সব প্রোডাক্ট দেখুন
        </Link>
      </main>
    );
  }

  const price = Number(product.price);
  const discountPrice =
    product.discountPrice != null ? Number(product.discountPrice) : null;
  const hasDiscount = discountPrice != null && discountPrice < price;
  const discountPct = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#ec4899]">হোম</Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-[#ec4899]">দোকান</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      {/* Two-column layout: stacked on mobile */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        {/* Left: image */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-pink-100 bg-pink-50 shadow-sm">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl">💄</div>
          )}
          {product.isNew && (
            <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow">
              NEW
            </span>
          )}
          {hasDiscount && (
            <span className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow">
              SALE -{discountPct}%
            </span>
          )}
        </div>

        {/* Right: details */}
        <div className="flex flex-col">
          {product.brand && (
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
              {product.brand}
            </p>
          )}
          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="rounded-full bg-pink-50 px-3 py-1 font-medium text-[#ec4899]">
              {product.category}
            </span>
            {product.inStock ? (
              <span className="flex items-center gap-1 font-medium text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500" /> স্টকে আছে
              </span>
            ) : (
              <span className="flex items-center gap-1 font-medium text-red-600">
                <span className="h-2 w-2 rounded-full bg-red-500" /> স্টক শেষ
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            {hasDiscount ? (
              <>
                <span className="text-3xl font-extrabold text-[#ec4899]">
                  ৳{discountPrice.toLocaleString("en-BD")}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  ৳{price.toLocaleString("en-BD")}
                </span>
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                  {discountPct}% ছাড়
                </span>
              </>
            ) : (
              <span className="text-3xl font-extrabold text-[#ec4899]">
                ৳{price.toLocaleString("en-BD")}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="mt-5 leading-relaxed text-gray-600">
              {product.description}
            </p>
          )}

          {/* Actions */}
          <ProductActions product={{ ...product, _id: product._id.toString() }} />

          {/* Delivery info */}
          <div className="mt-8 space-y-2 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
            <p>🚚 সারা বাংলাদেশে হোম ডেলিভারি — ফ্ল্যাট ৳৬০</p>
            <p>✅ ক্যাশ অন ডেলিভারি সুবিধা</p>
            <p>↩️ ৭ দিনের মধ্যে সহজ রিটার্ন</p>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">
            সম্পর্কিত প্রোডাক্ট
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {related.map((rp) => {
              const rpDiscount =
                rp.discountPrice != null && Number(rp.discountPrice) < Number(rp.price);
              const rpSlug = rp.slug || rp._id.toString();
              return (
                <Link
                  key={rp._id}
                  href={`/product/${encodeURIComponent(rpSlug)}`}
                  className="group overflow-hidden rounded-lg border border-gray-100 bg-white transition-colors hover:border-pink-200"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-pink-50">
                    {rp.image ? (
                      <Image
                        src={rp.image}
                        alt={rp.name}
                        fill
                        sizes="(max-width: 768px) 45vw, 22vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">💄</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-1 text-sm font-medium text-gray-800 group-hover:text-[#ec4899]">
                      {rp.name}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-[#ec4899]">
                      ৳{(rpDiscount ? rp.discountPrice : rp.price).toLocaleString("en-BD")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
