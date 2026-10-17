import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

// Primary palette (professional fashion-store look)
const PINK = "#ec4899";

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
 * from the deployment origin (Vercel sets VERCEL_URL / NEXT_PUBLIC_BASE_URL).
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
    <main className="min-h-screen bg-white text-gray-800">
      {/* Navbar */}
      <Navbar active="home" />

      {/* ────────────────────────────────────────────────
          1. HERO SECTION — soft pink gradient banner
      ──────────────────────────────────────────────── */}
      <section className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-pink-100 to-rose-200 md:min-h-[500px]">
        {/* Decorative soft blobs */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-pink-200/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-rose-300/50 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-4 py-12 text-center sm:py-16">
          <h1 className="text-3xl font-extrabold leading-tight text-gray-800 sm:text-4xl md:text-5xl">
            আপনার সৌন্দর্যের যত্নে{" "}
            <span style={{ color: PINK }}>রূপসী</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 sm:text-lg md:text-xl">
            স্কিনকেয়ার, মেকআপ ও হেয়ারকেয়ারের সেরা কালেকশন
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full px-8 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: PINK }}
          >
            এখনই কিনুন
          </Link>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          2. FEATURED CATEGORIES — admin-controlled grid
      ──────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-800 sm:text-3xl">
            আমাদের ক্যাটাগরি
          </h2>

          {categories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-pink-200 bg-white px-6 py-12 text-center">
              <p className="text-lg text-gray-700">
                🏷️ এখনো কোনো ক্যাটাগরি যোগ করা হয়নি।{" "}
                <Link
                  href="/admin"
                  className="font-semibold hover:underline"
                  style={{ color: PINK }}
                >
                  অ্যাডমিন প্যানেল
                </Link>{" "}
                থেকে &quot;হোমপেজে দেখান&quot; চালু করুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {categories.map((cat) => (
                <div
                  key={cat.english}
                  className="group rounded-xl bg-white p-6 text-center shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <Link href={cat.href}>
                    <div className="mb-3 text-4xl">{cat.icon}</div>
                    <h3 className="font-bold text-gray-800 group-hover:text-[#ec4899]">
                      {cat.name}
                    </h3>
                    <p
                      className="mt-2 text-sm font-medium"
                      style={{ color: PINK }}
                    >
                      দেখুন →
                    </p>
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
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          3. FEATURED PRODUCTS — showcase grid
      ──────────────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              জনপ্রিয় প্রোডাক্ট
            </h2>
            <Link
              href="/shop"
              className="shrink-0 text-sm font-semibold hover:underline"
              style={{ color: PINK }}
            >
              সব দেখুন →
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50 px-6 py-12 text-center">
              <p className="text-lg text-gray-700">
                🛍️ এখনো কোনো ফিচারড প্রোডাক্ট নেই।{" "}
                <Link
                  href="/admin"
                  className="font-semibold hover:underline"
                  style={{ color: PINK }}
                >
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
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              <div className="mt-10 text-center">
                <Link
                  href="/shop"
                  className="inline-flex min-h-12 items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105"
                  style={{ backgroundColor: PINK }}
                >
                  সব প্রোডাক্ট দেখুন
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          4. NEWSLETTER SECTION
      ──────────────────────────────────────────────── */}
      <section className="py-16" style={{ backgroundColor: "#fdf2f8" }}>
        <div className="mx-auto max-w-xl px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            নতুন অফার পেতে সাবস্ক্রাইব করুন
          </h2>
          <p className="mt-3 text-sm text-gray-500 sm:text-base">
            রূপসীর এক্সক্লুসিভ ডিসকাউন্ট ও নতুন কালেকশনের খবর সরাসরি আপনার
            ইনবক্সে।
          </p>
          <NewsletterForm />
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

/** Simple client-side newsletter form (demo — no backend yet) */
async function NewsletterForm() {
  // Rendered statically; interactivity handled by a tiny inline client island
  return (
    <form
      className="mt-6 flex min-h-12 flex-col gap-3 sm:flex-row"
      action="#"
    >
      <input
        type="email"
        required
        placeholder="আপনার ইমেইল ঠিকানা"
        className="min-h-12 flex-1 rounded-full border border-pink-200 bg-white px-5 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#ec4899]"
      />
      <button
        type="submit"
        className="min-h-12 rounded-full px-8 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105"
        style={{ backgroundColor: PINK }}
      >
        সাবস্ক্রাইব
      </button>
    </form>
  );
}

/**
 * Product card per Phase 6 spec:
 * white container + gray-100 border → hover pink-200 border,
 * aspect-[3/4] image zooming on hover, NEW badge (blue, top-left),
 * SALE badge (red, top-right), brand small uppercase gray,
 * line-clamp-2 title, bold pink discounted price + strikethrough original,
 * Quick Add button hidden on mobile, slides up from bottom on desktop hover,
 * out-of-stock overlay with "স্টক নেই".
 */
function ProductCard({ product }) {
  const hasDiscount =
    product.discountPrice != null &&
    Number(product.discountPrice) < Number(product.price);
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white transition-colors duration-300 hover:border-pink-200">
      {/* Image (links to the product detail page) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-pink-50">
      <Link href={`/product/${encodeURIComponent(product.slug || product._id)}`} className="absolute inset-0 z-0 block" aria-label={product.name}>
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 45vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">💄</div>
        )}

        {/* Badges — corners */}
        {product.isNew && (
          <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow">
            NEW
          </span>
        )}
        {hasDiscount && (
          <span className="absolute right-2 top-2 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow">
            SALE -{discountPct}%
          </span>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-red-600">
              স্টক নেই
            </span>
          </div>
        )}

      </Link>

        {/* Quick Add — hidden on mobile, slides up on desktop hover */}
        {product.inStock && (
          <div className="absolute inset-x-0 bottom-0 hidden translate-y-full p-2 transition-transform duration-300 ease-out group-hover:translate-y-0 md:block">
            <Link
              href={`/shop?add=${encodeURIComponent(product._id)}`}
              className="block w-full rounded-lg py-2.5 text-center text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: PINK }}
            >
              কার্টে যোগ করো
            </Link>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="relative z-10 p-4">
        {product.brand && (
          <p className="text-xs uppercase tracking-wide text-gray-400">
            {product.brand}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 min-h-[2.6em] text-sm font-medium text-gray-800 group-hover:text-[#ec4899] sm:text-base">
          <Link href={`/product/${encodeURIComponent(product.slug || product._id)}`}>{product.name}</Link>
        </h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-lg font-bold" style={{ color: PINK }}>
                {formatBDT(product.discountPrice)}
              </span>
              <span className="text-sm font-medium text-gray-400 line-through">
                {formatBDT(product.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold" style={{ color: PINK }}>
              {formatBDT(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
