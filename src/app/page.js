import Link from "next/link";
import Image from "next/image";

/* ──────────────────────────────────────────────────────────
   Phase 8.0 — Dynamic Homepage (Luxury Rose design preserved)
   Fetches real data from MongoDB via API routes.
────────────────────────────────────────────────────────── */

export const dynamic = "force-dynamic";

/* ── Helpers ── */

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
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function formatBDT(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

/** Map a DB product → card shape used by the Luxury Rose design */
function toCardProduct(p) {
  const hasDiscount =
    p.discountPrice != null && Number(p.discountPrice) < Number(p.price);
  const discountPct = hasDiscount
    ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
    : 0;

  let badge = null;
  if (p.isHotOffer && hasDiscount) badge = `-${discountPct}%`;
  else if (p.isHotOffer) badge = "HOT";
  else if (p.isNew) badge = "NEW";
  else if (p.isFeatured) badge = "BESTSELLER";

  return {
    id: p._id,
    slug: p.slug || p._id,
    name: p.name,
    price: hasDiscount ? p.discountPrice : p.price,
    originalPrice: hasDiscount ? p.price : null,
    image: p.image || "",
    badge,
    rating: 4.8,
    brand: p.brand || "",
    inStock: p.inStock !== false,
  };
}

/* ── Static content (not from DB) ── */

const trustItems = [
  { icon: "🏆", title: "100% Authentic", subtitle: "Direct from top brands" },
  { icon: "↩️", title: "7-Day Easy Return", subtitle: "Hassle-free refund" },
  { icon: "🚚", title: "Express Shipping", subtitle: "Nationwide delivery" },
  { icon: "🛡️", title: "Secure Payment", subtitle: "bKash, Nagad & Cards" },
];

const whyChooseUs = [
  {
    icon: "🌿",
    title: "Clean & Organic",
    desc: "Pure natural ingredients. Free from harmful parabens, sulfates and toxins.",
  },
  {
    icon: "🧪",
    title: "Dermatologist Tested",
    desc: "Clinically tested by skin experts — safe and effective for all skin types.",
  },
  {
    icon: "🐾",
    title: "Cruelty-Free",
    desc: "We love animals. No product or ingredient is ever tested on animals.",
  },
  {
    icon: "💎",
    title: "Premium Quality",
    desc: "Only the finest formulations for lasting radiance and healthy skin.",
  },
];

const reviews = [
  {
    stars: 5,
    text: "The Vitamin C serum transformed my skin in just two weeks. Absolutely glowing!",
    name: "Anika Rahman",
    location: "Dhaka",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    stars: 5,
    text: "Best makeup products I've used. The lipstick stays all day and feels so luxurious.",
    name: "Sadia Akter",
    location: "Chittagong",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    stars: 5,
    text: "Fast delivery and authentic products. Rupshi is now my go-to beauty store.",
    name: "Nusrat Jahan",
    location: "Sylhet",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
  },
];

/* ── UI Components ── */

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`text-xs ${
            i < Math.floor(rating) ? "text-amber-400" : "text-slate-300"
          }`}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-xs text-slate-500">{rating}</span>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-100/50">
      <Link
        href={`/product/${encodeURIComponent(product.slug)}`}
        className="relative aspect-[3/4] overflow-hidden bg-rose-50"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={533}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl opacity-30">
            💄
          </div>
        )}
        {product.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow ${
              product.badge === "NEW"
                ? "bg-sky-500"
                : product.badge.startsWith("-") ||
                  product.badge === "BOGO" ||
                  product.badge === "HOT"
                ? "bg-rose-500"
                : "bg-amber-500"
            }`}
          >
            {product.badge}
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <span className="rounded-full bg-white/95 px-4 py-1.5 text-sm font-bold text-rose-600">
              স্টক নেই
            </span>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <StarRating rating={product.rating} />
        {product.brand && (
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-rose-400">
            {product.brand}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-rose-600">
          <Link href={`/product/${encodeURIComponent(product.slug)}`}>
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-lg font-bold text-rose-600">
            {formatBDT(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-slate-400 line-through">
              {formatBDT(product.originalPrice)}
            </span>
          )}
        </div>
        <Link
          href={`/product/${encodeURIComponent(product.slug)}`}
          className="mt-3 block w-full rounded-xl bg-rose-600 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-rose-700"
        >
          View Product
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="col-span-full rounded-2xl border-2 border-dashed border-rose-200 bg-white p-10 text-center">
      <p className="text-slate-500">{message}</p>
    </div>
  );
}

/* ── Page ── */

export default async function Home() {
  const [catData, featuredData, hotData, newestData] = await Promise.all([
    safeFetch(apiUrl("/api/categories?homeVisible=true")),
    safeFetch(apiUrl("/api/products?featured=true&limit=4")),
    safeFetch(apiUrl("/api/products?hotOffer=true&limit=3")),
    safeFetch(apiUrl("/api/products?sort=newest&limit=4")),
  ]);

  // Categories — prefer tree (main + children), fall back to flat list
  const catTree =
    catData?.success && Array.isArray(catData.tree) ? catData.tree : [];
  const categories =
    catTree.length > 0
      ? catTree.map((c) => ({
          name: c.name,
          icon: c.icon || "🛍️",
          slug: c.slug || c.name,
          count: (c.children || []).length || "",
        }))
      : catData?.success && Array.isArray(catData.categories)
      ? catData.categories
          .filter((c) => !c.parentCategory)
          .map((c) => ({
            name: c.name,
            icon: c.icon || "🛍️",
            slug: c.slug || c.name,
            count: "",
          }))
      : [];

  const bestSellers =
    featuredData?.success && Array.isArray(featuredData.products)
      ? featuredData.products.map(toCardProduct)
      : [];

  const hotOffers =
    hotData?.success && Array.isArray(hotData.products)
      ? hotData.products.map(toCardProduct)
      : [];

  const newArrivals =
    newestData?.success && Array.isArray(newestData.products)
      ? newestData.products.map(toCardProduct)
      : [];

  return (
    <div className="min-h-screen bg-[#fdf8f9] text-slate-800">
      {/* ── A. TOP ANNOUNCEMENT BAR ── */}
      <div className="bg-rose-600 py-2.5 text-center text-sm font-medium text-white">
        ✨ Free Express Delivery on orders over ৳1,999! Code: GLOW2026 ✨
      </div>

      {/* ── B. HERO SECTION ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-amber-50/40 to-rose-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="text-center lg:text-left">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-rose-500">
              Rupshi Cosmetics
            </p>
            <h1 className="font-serif text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Reveal Your Skin's
              <span className="block text-rose-600">Natural Radiance</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-slate-600 lg:mx-0">
              Premium skincare, makeup & haircare crafted for the modern
              beauty lover. Clean, effective, and cruelty-free.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-rose-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition-all hover:scale-105 hover:bg-rose-700"
              >
                Shop Collection
              </Link>
              <Link
                href="/shop?hotOffer=true"
                className="inline-flex items-center justify-center rounded-full border-2 border-rose-200 bg-white px-8 py-3.5 text-sm font-semibold text-rose-600 transition-all hover:border-rose-400 hover:bg-rose-50"
              >
                View Offers
              </Link>
            </div>
          </div>

          <div className="relative mx-auto flex justify-center">
            <div className="relative h-72 w-72 overflow-hidden rounded-full border-8 border-white shadow-2xl shadow-rose-200/60 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
              <Image
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop"
                alt="Luxury skincare products"
                width={400}
                height={400}
                priority
                className="h-full w-full object-cover"
              />
            </div>
            <div className="pointer-events-none absolute -inset-4 rounded-full border border-rose-200/50" />
            <div className="pointer-events-none absolute -inset-8 rounded-full border border-rose-100/40" />
          </div>
        </div>
      </section>

      {/* ── C. TRUST BAR ── */}
      <section className="relative z-10 -mt-8 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-rose-100 bg-white p-6 shadow-xl shadow-rose-100/40 sm:p-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {trustItems.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-50 text-2xl">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── D. EXPLORE CATEGORIES ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 className="mb-10 text-center font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
          Explore Categories
        </h2>
        {categories.length === 0 ? (
          <EmptyState message="No categories available yet. Add some from the Admin panel." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                className="group flex flex-col items-center rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-100/50"
              >
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-50 to-amber-50 text-4xl transition-transform duration-300 group-hover:scale-110">
                  {cat.icon}
                </div>
                <h3 className="text-base font-bold text-slate-800 group-hover:text-rose-600">
                  {cat.name}
                </h3>
                {cat.count !== "" && (
                  <p className="mt-1 text-xs text-slate-500">
                    {cat.count} sub-categories
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── E. BEST SELLERS ── */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
              Best Sellers
            </h2>
            <Link
              href="/shop"
              className="hidden text-sm font-semibold text-rose-600 hover:underline sm:block"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {bestSellers.length === 0 ? (
              <EmptyState message="No featured products yet. Mark products as Featured in Admin." />
            ) : (
              bestSellers.map((p) => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        </div>
      </section>

      {/* ── F. HOT OFFERS ── */}
      <section className="bg-gradient-to-br from-amber-50 via-rose-50 to-amber-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
              🔥 Hot Offers
            </h2>
            <Link
              href="/shop?hotOffer=true"
              className="hidden text-sm font-semibold text-rose-600 hover:underline sm:block"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotOffers.length === 0 ? (
              <EmptyState message="No hot offers yet. Toggle Hot Offer on products in Admin." />
            ) : (
              hotOffers.map((p) => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        </div>
      </section>

      {/* ── G. PROMO BANNER ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900">
          <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Get Up to 35% OFF
              </h2>
              <p className="mt-4 max-w-md text-base text-rose-100">
                Limited-time luxury deals on premium skincare & makeup. Glow
                starts now.
              </p>
              <Link
                href="/shop?hotOffer=true"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-rose-700 shadow-lg transition-all hover:scale-105 hover:bg-rose-50"
              >
                Claim Deal Now
              </Link>
            </div>
            <div className="relative mx-auto hidden h-56 w-full max-w-sm overflow-hidden rounded-2xl lg:block">
              <Image
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop"
                alt="Promo"
                width={400}
                height={300}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── H. NEW ARRIVALS ── */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
              New Arrivals
            </h2>
            <Link
              href="/shop"
              className="hidden text-sm font-semibold text-rose-600 hover:underline sm:block"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {newArrivals.length === 0 ? (
              <EmptyState message="No products yet. Add products from the Admin panel." />
            ) : (
              newArrivals.map((p) => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        </div>
      </section>

      {/* ── I. WHY CHOOSE US ── */}
      <section className="bg-[#fdf8f9] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-12 text-center font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-100/40"
              >
                <div className="mb-4 text-4xl">{item.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-slate-800">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── J. REVIEWS ── */}
      <section id="reviews" className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-12 text-center font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
            Loved by Thousands
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {reviews.map((r) => (
              <div
                key={r.name}
                className="rounded-3xl border border-rose-100 bg-[#fdf8f9] p-8 shadow-sm"
              >
                <div className="mb-4 flex gap-0.5 text-amber-400">
                  {[...Array(r.stars)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="mb-6 text-sm leading-relaxed text-slate-600">
                  &ldquo;{r.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src={r.avatar}
                    alt={r.name}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-rose-100"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {r.name}
                    </p>
                    <p className="text-xs text-slate-500">{r.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-rose-600 to-pink-600 py-14 text-center">
        <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
          Ready to Glow?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-rose-100">
          Discover premium beauty products loved by thousands across Bangladesh.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-rose-600 shadow-lg transition-all hover:scale-105"
        >
          Shop Now
        </Link>
      </section>
    </div>
  );
}
