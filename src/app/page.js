import Link from "next/link";
import Image from "next/image";

/* ──────────────────────────────────────────────────────────
   DEMO DATA — Static Luxury Rose Homepage (Phase 7.8)
   No database fetching. Pure visual verification.
────────────────────────────────────────────────────────── */

const bestSellers = [
  {
    id: 1,
    name: "Rose Glow Vitamin C Serum",
    price: 1490,
    image:
      "https://images.unsplash.com/photo-1620916569876-0a1a70ef4a0a?w=600&h=800&fit=crop",
    badge: "BESTSELLER",
    rating: 4.9,
  },
  {
    id: 2,
    name: "Hydra-Boost Hyaluronic Cream",
    price: 1890,
    image:
      "https://images.unsplash.com/photo-1570194065650-d99fb26b14b7?w=600&h=800&fit=crop",
    badge: "BESTSELLER",
    rating: 4.8,
  },
  {
    id: 3,
    name: "Velvet Matte Lipstick Set",
    price: 990,
    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=800&fit=crop",
    badge: "BESTSELLER",
    rating: 4.7,
  },
  {
    id: 4,
    name: "Radiance Eye Cream",
    price: 1290,
    image:
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=800&fit=crop",
    badge: "BESTSELLER",
    rating: 4.9,
  },
];

const hotOffers = [
  {
    id: 5,
    name: "Complete Skincare Routine Kit",
    price: 2490,
    originalPrice: 3590,
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=800&fit=crop",
    badge: "-30%",
    rating: 4.8,
  },
  {
    id: 6,
    name: "Luxe Foundation SPF 30",
    price: 1390,
    originalPrice: 1990,
    image:
      "https://images.unsplash.com/photo-1631730486572-226b1e126018?w=600&h=800&fit=crop",
    badge: "BOGO",
    rating: 4.6,
  },
  {
    id: 7,
    name: "Night Repair Oil",
    price: 1790,
    originalPrice: 2490,
    image:
      "https://images.unsplash.com/photo-1608248543807-ba3c7a1ab7b0?w=600&h=800&fit=crop",
    badge: "-28%",
    rating: 4.9,
  },
];

const newArrivals = [
  {
    id: 8,
    name: "Dewy Glass Skin Mist",
    price: 890,
    image:
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=800&fit=crop",
    badge: "NEW",
    rating: 4.7,
  },
  {
    id: 9,
    name: "Silk Hair Serum",
    price: 1190,
    image:
      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&h=800&fit=crop",
    badge: "NEW",
    rating: 4.8,
  },
  {
    id: 10,
    name: "Bloom Blush Palette",
    price: 1590,
    image:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=800&fit=crop",
    badge: "NEW",
    rating: 4.9,
  },
  {
    id: 11,
    name: "Cleanse & Glow Foam",
    price: 790,
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=800&fit=crop",
    badge: "NEW",
    rating: 4.6,
  },
];

const promoBanner = {
  title: "Get Up to 35% OFF",
  subtitle: "Limited-time luxury deals on premium skincare & makeup. Glow starts now.",
  buttonText: "Claim Deal Now",
  imageUrl:
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop",
};

const categories = [
  { name: "Skincare", icon: "✨", count: 48 },
  { name: "Makeup", icon: "💄", count: 62 },
  { name: "Haircare", icon: "🧴", count: 27 },
  { name: "Fragrance", icon: "🌸", count: 19 },
];

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

/* ──────────────────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────────────────── */

function formatBDT(amount) {
  return `৳${Number(amount).toLocaleString("en-BD")}`;
}

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
      <div className="relative aspect-[3/4] overflow-hidden bg-rose-50">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={533}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {product.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow ${
              product.badge === "NEW"
                ? "bg-sky-500"
                : product.badge.startsWith("-") || product.badge === "BOGO"
                ? "bg-rose-500"
                : "bg-amber-500"
            }`}
          >
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <StarRating rating={product.rating} />
        <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-rose-600">
          {product.name}
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
        <button className="mt-3 w-full rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   PAGE
────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fdf8f9] text-slate-800">
      {/* ── A. TOP ANNOUNCEMENT BAR ── */}
      <div className="bg-rose-600 py-2.5 text-center text-sm font-medium text-white">
        ✨ Free Express Delivery on orders over ৳1,999! Code: GLOW2026 ✨
      </div>

      {/* ── B. HERO SECTION ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-amber-50/40 to-rose-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
          {/* Text */}
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

          {/* Image — Circular */}
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
            {/* Decorative rings */}
            <div className="pointer-events-none absolute -inset-4 rounded-full border border-rose-200/50" />
            <div className="pointer-events-none absolute -inset-8 rounded-full border border-rose-100/40" />
          </div>
        </div>
      </section>

      {/* ── C. TRUST BAR (Floating Card) ── */}
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
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/shop?category=${encodeURIComponent(cat.name.toLowerCase())}`}
              className="group flex flex-col items-center rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-100/50"
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-50 to-amber-50 text-4xl transition-transform duration-300 group-hover:scale-110">
                {cat.icon}
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-rose-600">
                {cat.name}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{cat.count} products</p>
            </Link>
          ))}
        </div>
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
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
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
            {hotOffers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── G. PROMO BANNER ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900">
          <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {promoBanner.title}
              </h2>
              <p className="mt-4 max-w-md text-base text-rose-100">
                {promoBanner.subtitle}
              </p>
              <Link
                href="/shop?hotOffer=true"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-rose-700 shadow-lg transition-all hover:scale-105 hover:bg-rose-50"
              >
                {promoBanner.buttonText}
              </Link>
            </div>
            <div className="relative mx-auto hidden h-56 w-full max-w-sm overflow-hidden rounded-2xl lg:block">
              <Image
                src={promoBanner.imageUrl}
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
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
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
