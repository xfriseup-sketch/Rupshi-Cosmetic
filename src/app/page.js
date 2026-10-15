import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

// High-quality cosmetic background photo (Unsplash) for the hero section
const HERO_BG =
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1920&q=80";

/** Format a number as Bangladeshi Taka, e.g. ৳1,200 */
function formatBDT(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

// Homepage shows live categories/products from MongoDB — render per request
// (also avoids build-time fetch attempts when the DB is not yet configured).
export const dynamic = "force-dynamic";

/**
 * Fetch JSON from an internal API route with a short timeout.
 * Returns null on any failure (DB not configured, network error…)
 * so the page can render graceful fallbacks instead of crashing.
 *
 * Server components cannot use relative URLs, so we build an absolute URL
 * from the deployment origin (Vercel sets VERCEL_URL / VERCEL_PROJECT_...).
 */
function apiUrl(path) {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "")}${path}`;
  }
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}${path}`;
  return `http://localhost:${process.env.PORT || 3000}${path}`;
}
async function safeFetch(url) {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  // Phase 6: homepage pulls ONLY home-visible categories and featured products
  const [catData, prodData] = await Promise.all([
    safeFetch(apiUrl("/api/categories?homeVisible=true")),
    safeFetch(apiUrl("/api/products?featured=true&limit=8")),
  ]);

  // Nested tree: [{ name, slug, icon, children: [...] }] — ONLY categories
  // with isHomeVisible === true (admin-controlled via "হোমপেজে দেখান")
  const homeTree =
    catData?.success && Array.isArray(catData.tree) ? catData.tree : [];

  const categories = homeTree.map((c) => ({
    name: c.name,
    english: c.slug || c.name,
    icon: c.icon || "🛍️",
    description: "",
    href: `/shop?category=${encodeURIComponent(c.slug || c.name)}`,
    children: (c.children || []).map((ch) => ({
      name: ch.name,
      href: `/shop?category=${encodeURIComponent(ch.slug || ch.name)}`,
    })),
  }));

  // Featured products for the "জনপ্রিয় প্রোডাক্ট" section (max 8)
  const featured =
    prodData?.success && Array.isArray(prodData.products)
      ? prodData.products.slice(0, 8)
      : [];

  return (
    <main className="min-h-screen bg-pink-50">
      {/* Navbar */}
      <Navbar active="home" />

      {/* Hero Section — background image + dark/pink overlay */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <Image
          src={HERO_BG}
          alt="কসমেটিক ব্যাকগ্রাউন্ড"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark + pink gradient overlay keeps text readable */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#db2777]/80 via-pink-900/70 to-black/70" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-28 text-center sm:py-36">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white drop-shadow-lg">
            তোমার আসল সৌন্দর্য{" "}
            <span className="text-pink-200">ফুটে উঠুক</span>
          </h1>
          <p className="max-w-xl text-lg text-pink-100">
            ১০০% অরিজিনাল কসমেটিক পণ্য, সাশ্রয়ী দামে। বিশ্বস্ততার সাথে যত্ন নাও
            নিজের।
          </p>
          <Link
            href="/shop"
            className="rounded-full bg-white px-8 py-3 text-lg font-semibold text-[#db2777] shadow-lg transition-transform hover:scale-105 hover:bg-pink-100"
          >
            কেনাকাটা শুরু করো
          </Link>
        </div>
      </section>

      {/* Categories Section — admin-controlled (isHomeVisible) */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
          জনপ্রিয় <span className="text-[#db2777]">ক্যাটাগরি</span>
        </h2>

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50 px-6 py-12 text-center">
            <p className="text-lg text-gray-700">
              🏷️ এখনো কোনো ক্যাটাগরি যোগ করা হয়নি।{" "}
              <Link href="/admin" className="font-semibold text-[#db2777] hover:underline">
                অ্যাডমিন প্যানেল
              </Link>{" "}
              থেকে &quot;হোমপেজে দেখান&quot; চালু করুন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {categories.map((cat) => (
              <div
                key={cat.english}
                className="group rounded-2xl border border-pink-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-[#db2777] hover:shadow-lg sm:p-8"
              >
                <Link href={cat.href}>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-3xl transition-colors group-hover:bg-[#db2777]">
                    <span>{cat.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#db2777] sm:text-xl">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="mt-2 text-sm text-gray-500">{cat.description}</p>
                  )}
                </Link>
                {/* Sub-category quick links (nested system) */}
                {cat.children.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {cat.children.map((ch) => (
                      <Link
                        key={ch.href}
                        href={ch.href}
                        className="rounded-full bg-pink-50 px-2.5 py-1 text-xs text-[#9d174d] hover:bg-pink-100"
                      >
                        {ch.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Popular Products Section — admin-controlled (isFeatured) */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 flex items-end justify-between gap-4">
            <h2 className="text-3xl font-bold text-gray-900">
              জনপ্রিয় <span className="text-[#db2777]">প্রোডাক্ট</span>
            </h2>
            <Link
              href="/shop"
              className="hidden shrink-0 text-sm font-semibold text-[#db2777] hover:underline sm:block"
            >
              সব দেখো →
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50 px-6 py-12 text-center">
              <p className="text-lg text-gray-700">
                🛍️ এখনো কোনো ফিচারড প্রোডাক্ট নেই।{" "}
                <Link href="/admin" className="font-semibold text-[#db2777] hover:underline">
                  অ্যাডমিন প্যানেল
                </Link>{" "}
                থেকে প্রোডাক্টে &quot;ফিচারড&quot; টগল চালু করুন।
              </p>
            </div>
          ) : (
            <>
              {/* Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {featured.map((p) => (
                  <ProductCard key={p._id} product={p} className="" />
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link
                  href="/shop"
                  className="inline-block rounded-full bg-[#db2777] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9d174d]"
                >
                  সব প্রোডাক্ট দেখো
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#9d174d] py-8 text-center text-pink-100">
        <p className="text-lg font-semibold">রূপসী - কসমেটিক শপ</p>
        <p className="mt-2 text-sm">© ২০২৬ রূপসী। সর্বস্বত্ব সংরক্ষিত।</p>
      </footer>
    </main>
  );
}

/**
 * Product card per Phase 6 spec:
 * aspect-[3/4] image, NEW badge (blue), SALE badge + discount % (red),
 * brand in small uppercase gray, line-clamp-2 title, strikethrough old
 * price + bold pink discounted price, out-of-stock overlay.
 */
function ProductCard({ product, className = "" }) {
  const hasDiscount =
    product.discountPrice != null && Number(product.discountPrice) < Number(product.price);
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Link
      href="/shop"
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-[#db2777] hover:shadow-lg ${className}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-pink-50">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 45vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">💄</div>
        )}

        {/* Badges — top corner */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow">
              NEW
            </span>
          )}
          {hasDiscount && (
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow">
              SALE -{discountPct}%
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-red-600">
              স্টক নেই
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        {product.brand && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
            {product.brand}
          </p>
        )}
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.6em] text-sm font-semibold text-gray-900 group-hover:text-[#db2777] sm:text-base">
          {product.name}
        </h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-lg font-extrabold text-[#db2777]">
                {formatBDT(product.discountPrice)}
              </span>
              <span className="text-sm font-medium text-gray-400 line-through">
                {formatBDT(product.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-[#db2777]">{formatBDT(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
