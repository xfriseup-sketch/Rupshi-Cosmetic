import Image from "next/image";
import Link from "next/link";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductActions from "./ProductActions";

export const dynamic = "force-dynamic";

/**
 * GET /product/[slug]
 * Single product detail page.
 * Next.js 14: `params` is a Promise — it MUST be awaited.
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

      product = await Product.findOne({ slug: decodeURIComponent(slug) }).lean();

      if (!product && mongoose.Types.ObjectId.isValid(slug)) {
        product = await Product.findById(slug).lean();
      }

      if (!product) {
        product = await Product.findOne({ name: decodeURIComponent(slug) }).lean();
      }

      if (product) {
        const found = await Product.find({
          category: product.category,
          _id: { $ne: product._id },
        })
          .limit(8)
          .lean();
        related = found.sort(() => 0.5 - Math.random()).slice(0, 4);
      }
    }
  } catch (error) {
    console.error("PRODUCT PAGE LOAD FAILED:", error);
  }

  if (!dbOk) {
    return (
      <>
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16 text-center">
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
      </>
    );
  }

  if (!product) {
    return (
      <>
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16 text-center">
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
      </>
    );
  }

  const price = Number(product.price);
  const discountPrice =
    product.discountPrice != null ? Number(product.discountPrice) : null;
  const hasDiscount = discountPrice != null && discountPrice < price;
  const discountPct = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;

  const department = product.department || "beauty";
  const sizes = Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [];
  const colors = Array.isArray(product.colors) ? product.colors.filter(Boolean) : [];
  const specs = Array.isArray(product.specs)
    ? product.specs.filter((s) => s && (s.label || s.value))
    : [];

  const isFashion = department === "fashion";
  const isBeautyOrTech = department === "beauty" || department === "tech";

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16 sm:pt-28">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#ec4899]">হোম</Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-[#ec4899]">দোকান</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{product.name}</span>
        </nav>

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

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-pink-50 px-3 py-1 font-medium text-[#ec4899]">
                {product.category}
              </span>
              {department && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-600">
                  {department === "beauty" && "💄 Beauty"}
                  {department === "fashion" && "👕 Fashion"}
                  {department === "tech" && "🎮 Tech"}
                </span>
              )}
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

            {/* ===== Fashion: Size & Color selectors ===== */}
            {isFashion && sizes.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold text-gray-800">সাইজ সিলেক্ট করুন</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <span
                      key={size}
                      className="inline-flex min-w-[2.75rem] items-center justify-center rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm font-medium text-gray-800"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {isFashion && colors.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-gray-800">কালার সিলেক্ট করুন</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <span
                      key={color}
                      className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800"
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-gray-200"
                        style={{
                          backgroundColor: /^#|rgb|hsl|var/.test(color)
                            ? color
                            : undefined,
                        }}
                        title={color}
                      />
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ===== Beauty / Tech: Specifications table ===== */}
            {isBeautyOrTech && specs.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-gray-800">স্পেসিফিকেশন</p>
                <div className="overflow-hidden rounded-xl border border-pink-100 bg-white">
                  <table className="w-full text-sm">
                    <tbody>
                      {specs.map((row, idx) => (
                        <tr
                          key={`${row.label}-${idx}`}
                          className={idx % 2 === 0 ? "bg-white" : "bg-pink-50/50"}
                        >
                          <td className="w-2/5 border-b border-pink-50 px-4 py-2.5 font-medium text-gray-600">
                            {row.label}
                          </td>
                          <td className="border-b border-pink-50 px-4 py-2.5 text-gray-900">
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Fashion products may also have specs — show only if present */}
            {isFashion && specs.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-gray-800">স্পেসিফিকেশন</p>
                <div className="overflow-hidden rounded-xl border border-pink-100 bg-white">
                  <table className="w-full text-sm">
                    <tbody>
                      {specs.map((row, idx) => (
                        <tr
                          key={`${row.label}-${idx}`}
                          className={idx % 2 === 0 ? "bg-white" : "bg-pink-50/50"}
                        >
                          <td className="w-2/5 border-b border-pink-50 px-4 py-2.5 font-medium text-gray-600">
                            {row.label}
                          </td>
                          <td className="border-b border-pink-50 px-4 py-2.5 text-gray-900">
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <ProductActions
              product={{
                ...product,
                _id: product._id.toString(),
                sizes,
                colors,
                department,
              }}
            />

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
    </>
  );
}
