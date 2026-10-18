import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";

// Primary palette (professional fashion-store look)
const PINK = "#ec4899";

/** Shared empty-state styling (Phase 7.7 polish: border-dashed, rounded-xl, p-8) */
const EMPTY_STATE =
  "rounded-xl border-2 border-dashed border-pink-200 bg-white p-8 text-center";

/** Hardcoded customer reviews (Phase 7.6 Step 2) */
const REVIEWS = [
  {
    stars: "⭐⭐⭐⭐⭐",
    text: "পণ্যের মান অসাধারণ! ডেলিভারিও খুব দ্রুত ছিল।",
    author: "আনিকা রহমান, ঢাকা",
  },
  {
    stars: "⭐⭐⭐⭐⭐",
    text: "স্কিনকেয়ার প্রোডাক্টগুলো ব্যবহার করে ত্বক অনেক ভালো হয়েছে। অবশ্যই আবার কিনব।",
    author: "সাদিয়া আক্তার, চট্টগ্রাম",
  },
  {
    stars: "⭐⭐⭐⭐☆",
    text: "মেকআপ কালেকশন দারুণ এবং দামও সাশ্রয়ী। রূপসীকে ধন্যবাদ।",
    author: "নুসরাত জাহান, সিলেট",
  },
];

/** Trust bar items (cosmetic-store focused, Bengali + English subtitle) */
{/* TRUST BAR - Premium Minimalist Line */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
  <div className="border-y border-pink-100 py-6 bg-white/50 backdrop-blur-sm">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      
      {/* Item 1 */}
      <div className="flex items-center justify-center gap-3 group cursor-default">
        <span className="text-2xl text-pink-500 group-hover:scale-110 transition-transform duration-300">🛡️</span>
        <div className="text-left">
          <span className="block font-semibold text-gray-900 text-sm">১০০% অরিজিনাল পণ্য</span>
          <span className="block text-gray-500 text-xs">Authentic Guarantee</span>
        </div>
      </div>

      {/* Item 2 */}
      <div className="flex items-center justify-center gap-3 group cursor-default">
        <span className="text-2xl text-pink-500 group-hover:scale-110 transition-transform duration-300">💵</span>
        <div className="text-left">
          <span className="block font-semibold text-gray-900 text-sm">ক্যাশ অন ডেলিভারি</span>
          <span className="block text-gray-500 text-xs">Pay after inspection</span>
        </div>
      </div>

      {/* Item 3 */}
      <div className="flex items-center justify-center gap-3 group cursor-default">
        <span className="text-2xl text-pink-500 group-hover:scale-110 transition-transform duration-300">🌿</span>
        <div className="text-left">
          <span className="block font-semibold text-gray-900 text-sm">ক্রুয়েলটি-ফ্রি</span>
          <span className="block text-gray-500 text-xs">Never tested on animals</span>
        </div>
      </div>

      {/* Item 4 */}
      <div className="flex items-center justify-center gap-3 group cursor-default">
        <span className="text-2xl text-pink-500 group-hover:scale-110 transition-transform duration-300">🎧</span>
        <div className="text-left">
          <span className="block font-semibold text-gray-900 text-sm">বিউটি কনসালটেন্ট</span>
          <span className="block text-gray-500 text-xs">Free skin advice</span>
        </div>
      </div>

    </div>
  </div>
</section>
/** "Why Choose Us" cards (Phase 7.7) */
const WHY_CHOOSE_US = [
  {
    icon: "🌿",
    title: "১০০% অরিজিনাল",
    desc: "আমরা কেবল ব্র্যান্ডেড ও অথেন্টিক পণ্য বিক্রি করি।",
  },
  {
    icon: "⚡",
    title: "দ্রুত ডেলিভারি",
    desc: "ঢাকায় ২৪ ঘণ্টায় এবং দেশব্যাপী ৪৮ ঘণ্টায় পৌঁছে যায়।",
  },
  {
    icon: "💰",
    title: "সাশ্রয়ী দাম",
    desc: "মানসম্মত পণ্য সবচেয়ে কম দামে পাওয়ার নিশ্চয়তা।",
  },
];

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
  // Phase 6/7.6/7.7: homepage pulls home-visible categories, hot offers,
  // featured products and additional in-stock products from MongoDB —
  // all admin-controlled via the panel.
  const [catData, hotData, prodData, moreData] = await Promise.all([
    safeFetch(apiUrl("/api/categories?homeVisible=true")),
    safeFetch(apiUrl("/api/products?hotOffer=true&limit=4")),
    safeFetch(apiUrl("/api/products?featured=true&limit=8")),
    // Phase 7.7: NOT featured AND NOT hot offer, but in stock (max 4)
    safeFetch(
      apiUrl("/api/products?featured=false&hotOffer=false&inStock=true&limit=4")
    ),
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

  // Hot-offer products for the "হট অফার" section (max 4)
  const hotOffers =
    hotData?.success && Array.isArray(hotData.products)
      ? hotData.products.slice(0, 4)
      : [];

  // Featured products for the "জনপ্রিয় প্রোডাক্ট" section (max 8)
  const featured =
    prodData?.success && Array.isArray(prodData.products)
      ? prodData.products.slice(0, 8)
      : [];

  // Additional products for "আরও দারুণ প্রোডাক্ট" (Phase 7.7, max 4)
  const additional =
    moreData?.success && Array.isArray(moreData.products)
      ? moreData.products.slice(0, 4)
      : [];

  return (
    <main className="min-h-screen bg-white text-gray-800">

      {/* ────────────────────────────────────────────────
          1. HERO SECTION — Phase 7.6 Step 3 (EXACTLY as is)
             Custom hero image (/images/hero-banner.png) with dark overlay,
             white centered content, fade-up animation on load
      ──────────────────────────────────────────────── */}
      <section className="relative flex min-h-[400px] items-center justify-center overflow-hidden bg-cover bg-center md:min-h-[600px]" style={{ backgroundImage: "url('/images/hero-banner.png')" }}>
        {/* Dark overlay so white text stays readable */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Soft pink tint at the edges for brand consistency */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 via-transparent to-pink-700/20" />

        <div className="animate-fade-up relative mx-auto max-w-4xl px-4 py-12 text-center sm:py-16">
          <h1 className="text-5xl font-bold leading-tight text-white drop-shadow-lg md:text-7xl">
            আপনার সৌন্দর্যের যত্নে রূপসী
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-100 drop-shadow md:text-xl">
            স্কিনকেয়ার, মেকআপ ও হেয়ারকেয়ারের সেরা কালেকশন
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-pink-600 px-10 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-pink-700"
          >
            এখনই কিনুন
          </Link>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          2. TRUST BAR — Phase 7.7 PREMIUM redesign
             Centered icon wrappers with pink rings & soft shadows
      ──────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 text-center md:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title}>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-pink-50 shadow-sm ring-1 ring-pink-100">
                <span className="text-2xl">{item.icon}</span>
              </div>
              <p className="mb-1 text-sm font-bold text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-500">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          3. FEATURED CATEGORIES — admin-controlled grid
      ──────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-800">
            আমাদের ক্যাটাগরি
          </h2>

          {categories.length === 0 ? (
            <div className={EMPTY_STATE}>
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
                  className="group rounded-2xl bg-white p-8 text-center shadow-sm transition-all duration-300 hover:shadow-xl"
                >
                  <Link href={cat.href}>
                    <div className="mb-4 text-5xl">{cat.icon}</div>
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#ec4899]">
                      {cat.name}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-pink-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
          4. HOT OFFERS — Phase 7.6 (?hotOffer=true&limit=4)
      ──────────────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              🔥 হট অফার
            </h2>
            <Link
              href="/shop?hotOffer=true"
              className="shrink-0 text-sm font-semibold text-pink-600 hover:underline"
            >
              সব দেখুন →
            </Link>
          </div>

          {hotOffers.length === 0 ? (
            <div className={EMPTY_STATE}>
              <p className="text-lg text-gray-700">
                🔥 এখনো কোনো হট অফার প্রোডাক্ট নেই।{" "}
                <Link
                  href="/admin"
                  className="font-semibold hover:underline"
                  style={{ color: PINK }}
                >
                  অ্যাডমিন প্যানেল
                </Link>{" "}
                থেকে প্রোডাক্টে &quot;হট অফার&quot; টগল চালু করুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {hotOffers.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          5. FEATURED PRODUCTS — showcase grid
      ──────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              জনপ্রিয় প্রোডাক্ট
            </h2>
            <Link
              href="/shop"
              className="shrink-0 text-sm font-semibold text-pink-600 hover:underline"
            >
              সব দেখুন →
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className={EMPTY_STATE}>
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
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:bg-pink-700"
                >
                  সব প্রোডাক্ট দেখুন
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          6. PROMO BANNER — Full-width using /public/images/promo-banner.png
      ──────────────────────────────────────────────── */}
      <section className="relative flex min-h-[300px] w-full items-center justify-center overflow-hidden bg-cover bg-center py-12 md:min-h-[420px] md:py-20">
        {/* Background image (loaded via next/image as fill for optimization) */}
        <Image
          src="/images/promo-banner.png"
          alt="বিশেষ ছাড়ের অফার ব্যানার"
          fill
          priority={false}
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold drop-shadow-md md:text-5xl">
            বিশেষ ছাড়ের অফার!
          </h2>
          <p className="mb-8 text-lg drop-shadow md:text-xl">
            সীমিত সময়ের জন্য সকল প্রোডাক্টে ২০% পর্যন্ত ডিসকাউন্ট
          </p>
          <Link
            href="/shop?hotOffer=true"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-8 py-3 font-semibold text-pink-600 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-pink-600 hover:text-white"
          >
            অফার দেখুন
          </Link>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          7. ADDITIONAL PRODUCTS — Phase 7.7 NEW
             "আরও দারুণ প্রোডাক্ট" — NOT featured, NOT hot offer, in stock
             Same card design as Popular Products
      ──────────────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              আরও দারুণ প্রোডাক্ট
            </h2>
            <Link
              href="/shop"
              className="shrink-0 text-sm font-semibold text-pink-600 hover:underline"
            >
              সব দেখুন →
            </Link>
          </div>

          {additional.length === 0 ? (
            <div className={EMPTY_STATE}>
              <p className="text-lg text-gray-700">
                ✨ এই মুহূর্তে অতিরিক্ত প্রোডাক্ট নেই।{" "}
                <Link
                  href="/admin"
                  className="font-semibold hover:underline"
                  style={{ color: PINK }}
                >
                  অ্যাডমিন প্যানেল
                </Link>{" "}
                থেকে নতুন প্রোডাক্ট যোগ করুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {additional.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          8. CUSTOMER REVIEWS — Phase 7.6 Step 2 (hardcoded)
      ──────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            গ্রাহকদের মতামত
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {REVIEWS.map((r, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 text-yellow-400">{r.stars}</div>
                <p className="mb-4 italic text-gray-600">&quot;{r.text}&quot;</p>
                <p className="text-sm font-semibold text-gray-900">
                  - {r.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          9. WHY CHOOSE US — Phase 7.7 NEW
      ──────────────────────────────────────────────── */}
     {/* WHY CHOOSE US SECTION */}
<section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#FFFDFB]">
  
  {/* Section Header */}
  <div className="text-center max-w-2xl mx-auto mb-16">
    <span className="text-pink-600 font-semibold text-xs tracking-widest uppercase bg-pink-100/60 px-4 py-1.5 rounded-full inline-block mb-3 border border-pink-200/50">
      Glow With Confidence
    </span>
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight font-serif">
      কেন রূপসী বেছে নেবেন?
    </h2>
    <p className="text-slate-600 mt-4 text-sm sm:text-base leading-relaxed">
      আমরা নিয়ে আসছি প্রকৃতির সেরা উপাদান এবং বিজ্ঞানের সমন্বয়, আপনার ত্বকের প্রকৃত যত্নের জন্য।
    </p>
  </div>

  {/* Cards Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
    
    {/* Card 1 */}
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-pink-100 shadow-sm hover:shadow-xl hover:border-pink-300 transition-all duration-300 group hover:-translate-y-1">
      <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300 shadow-inner">
        🍃
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 font-serif">১০০% অর্গানিক ও ভেগান</h3>
      <p className="text-slate-600 text-sm leading-relaxed">
        বিশুদ্ধ উদ্ভিজ্জ নির্যাস দিয়ে তৈরি, ক্ষতিকর পারাবেন এবং সালফেট মুক্ত।
      </p>
    </div>

    {/* Card 2 */}
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-pink-100 shadow-sm hover:shadow-xl hover:border-pink-300 transition-all duration-300 group hover:-translate-y-1">
      <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300 shadow-inner">
        🧪
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 font-serif">ডার্মাটোলজিস্ট টেস্টেড</h3>
      <p className="text-slate-600 text-sm leading-relaxed">
        চর্মরোগ বিশেষজ্ঞদের দ্বারা ক্লিনিক্যালি টেস্টেড এবং সব ধরনের ত্বকের জন্য নিরাপদ।
      </p>
    </div>

    {/* Card 3 */}
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-pink-100 shadow-sm hover:shadow-xl hover:border-pink-300 transition-all duration-300 group hover:-translate-y-1">
      <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300 shadow-inner">
        🐾
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 font-serif">ক্রুয়েলটি-ফ্রি</h3>
      <p className="text-slate-600 text-sm leading-relaxed">
        আমরা প্রকৃতি ও প্রাণীদের ভালোবাসি। কোনো পণ্য প্রাণীদের ওপর পরীক্ষা করা হয় না।
      </p>
    </div>

    {/* Card 4 */}
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-pink-100 shadow-sm hover:shadow-xl hover:border-pink-300 transition-all duration-300 group hover:-translate-y-1">
      <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300 shadow-inner">
        🚀
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 font-serif">দ্রুত ডেলিভারি</h3>
      <p className="text-slate-600 text-sm leading-relaxed">
        দ্রুত, নিরাপদ এবং তাপমাত্রা নিয়ন্ত্রিত প্যাকেজিং নিশ্চিত করে যাতে পণ্য তাজা অবস্থায় পৌঁছায়।
      </p>
    </div>

  </div>

  {/* Trust Badge Bottom Bar */}
  <div className="mt-16 bg-gradient-to-r from-pink-50 via-amber-50 to-pink-50 rounded-2xl p-6 border border-pink-100 flex flex-wrap items-center justify-around gap-6 text-center">
    <div className="flex items-center gap-3 text-slate-700 font-medium text-sm">
      <span className="text-pink-500 text-lg">↩️</span>
      <span>সহজ ৭ দিনের রিটার্ন</span>
    </div>
    <div className="flex items-center gap-3 text-slate-700 font-medium text-sm">
      <span className="text-pink-500 text-lg">✅</span>
      <span>১০০% অথেনটিক গ্যারান্টি</span>
    </div>
    <div className="flex items-center gap-3 text-slate-700 font-medium text-sm">
      <span className="text-pink-500 text-lg">😊</span>
      <span>৫০,০০০+ সন্তুষ্ট গ্রাহক</span>
    </div>
  </div>

</section>

      {/* ────────────────────────────────────────────────
          10. NEWSLETTER SECTION
      ──────────────────────────────────────────────── */}
      <section className="bg-pink-50 py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
            নতুন অফার পেতে সাবস্ক্রাইব করুন
          </h2>
          <p className="mb-8 text-gray-600">
            সর্বশেষ ডিসকাউন্ট ও নতুন প্রোডাক্টের আপডেট সরাসরি আপনার ইমেইলে পান
          </p>
          <NewsletterForm />
        </div>
      </section>

    </main>
  );
}

/** Simple newsletter form (static demo markup — no backend yet) */
function NewsletterForm() {
  return (
    <form className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row" action="#">
      <input
        type="email"
        required
        placeholder="আপনার ইমেইল ঠিকানা"
        className="min-h-12 flex-1 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#ec4899] focus:ring-2 focus:ring-pink-500"
      />
      <button
        type="submit"
        className="min-h-12 rounded-full bg-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-pink-700"
      >
        সাবস্ক্রাইব
      </button>
    </form>
  );
}
