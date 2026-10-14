import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

// High-quality cosmetic background photo (Unsplash) for the hero section
const HERO_BG =
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1920&q=80";

const fallbackCategories = [
  {
    name: "স্কিনকেয়ার",
    english: "Skincare",
    icon: "🧴",
    description: "ফেসওয়াশ, ক্রিম, সিরাম ও ময়েশ্চারাইজার",
    href: "/shop?cat=skincare",
  },
  {
    name: "মেকআপ",
    english: "Makeup",
    icon: "💄",
    description: "লিপস্টিক, ফাউন্ডেশন, আইলাইনার ও ব্লাশ",
    href: "/shop?cat=makeup",
  },
  {
    name: "হেয়ারকেয়ার",
    english: "Haircare",
    icon: "💇‍♀️",
    description: "শ্যাম্পু, হেয়ার অয়েল ও হেয়ার মাস্ক",
    href: "/shop?cat=haircare",
  },
];

const CATEGORY_BN = {
  Skincare: "স্কিনকেয়ার",
  Makeup: "মেকআপ",
  Haircare: "হেয়ারকেয়ার",
  Fragrance: "ফ্র্যাগরেন্স",
};

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
  // Server-side fetches — no client JS needed for initial load
  const [catData, prodData] = await Promise.all([
    safeFetch(apiUrl("/api/categories")),
    safeFetch(apiUrl("/api/products")),
  ]);

  // Dynamic categories (fall back to the hardcoded trio when DB is absent)
  let categories = fallbackCategories;
  if (catData?.success && Array.isArray(catData.categories) && catData.categories.length > 0) {
    categories = catData.categories.map((c) => ({
      name: CATEGORY_BN[c.name] || c.name,
      english: c.name,
      icon: c.icon || "🛍️",
      description: "",
      href: `/shop?cat=${encodeURIComponent(c.slug || c.name)}`,
    }));
  }

  // Top 4 products for the "জনপ্রিয় প্রোডাক্ট" section
  const popular =
    prodData?.success && Array.isArray(prodData.products)
      ? prodData.products.slice(0, 4)
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

      {/* Categories Section */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
          জনপ্রিয় <span className="text-[#db2777]">ক্যাটাগরি</span>
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.english}
              href={cat.href}
              className="group rounded-2xl border border-pink-100 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-[#db2777] hover:shadow-lg"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-3xl transition-colors group-hover:bg-[#db2777]">
                <span>{cat.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#db2777]">
                {cat.name}
              </h3>
              {cat.description && (
                <p className="mt-2 text-sm text-gray-500">{cat.description}</p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Products Section */}
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

          {popular.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50 px-6 py-12 text-center">
              <p className="text-gray-600">
                🛍️ এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।{" "}
                <Link href="/admin" className="font-semibold text-[#db2777] hover:underline">
                  অ্যাডমিন প্যানেল
                </Link>{" "}
                থেকে প্রোডাক্ট যোগ করুন।
              </p>
            </div>
          ) : (
            <>
              {/* Horizontal scroll on mobile */}
              <div className="flex gap-5 overflow-x-auto pb-4 snap-x md:hidden">
                {popular.map((p) => (
                  <ProductCard key={p._id} product={p} className="w-64 shrink-0 snap-start" />
                ))}
              </div>
              {/* Grid on tablet/desktop */}
              <div className="hidden grid-cols-2 gap-6 md:grid lg:grid-cols-4">
                {popular.map((p) => (
                  <ProductCard key={p._id} product={p} className="" />
                ))}
              </div>
              <div className="mt-6 text-center sm:hidden">
                <Link
                  href="/shop"
                  className="inline-block rounded-full bg-[#db2777] px-6 py-2.5 text-sm font-semibold text-white"
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

/** Compact product card used in the "জনপ্রিয় প্রোডাক্ট" section */
function ProductCard({ product, className = "" }) {
  return (
    <Link
      href="/shop"
      className={`group overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-[#db2777] hover:shadow-lg ${className}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-pink-50">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 60vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">💄</div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-[#db2777]/90 px-2.5 py-1 text-xs font-semibold text-white">
          {CATEGORY_BN[product.category] || product.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="truncate font-semibold text-gray-900 group-hover:text-[#db2777]">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-[#db2777]">{formatBDT(product.price)}</span>
          {!product.inStock && (
            <span className="text-xs font-medium text-red-500">স্টক নেই</span>
          )}
        </div>
      </div>
    </Link>
  );
}
