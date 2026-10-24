import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  RefreshCw,
  Truck,
  CreditCard,
  Leaf,
  FlaskConical,
  PawPrint,
  Gem,
  Sparkles,
} from "lucide-react";
import { getHomePageData } from "@/lib/homeData";
import CopyCodeButton from "@/components/CopyCodeButton";

/* Force dynamic — never cache homepage so Admin changes show immediately */
export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatBDT(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

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

const trustItems = [
  { Icon: ShieldCheck, title: "100% Authentic", subtitle: "Direct from top brands" },
  { Icon: RefreshCw, title: "7-Day Easy Return", subtitle: "Hassle-free refund" },
  { Icon: Truck, title: "Express Shipping", subtitle: "Nationwide delivery" },
  { Icon: CreditCard, title: "Secure Payment", subtitle: "bKash, Nagad & Cards" },
];

const whyChooseUs = [
  {
    Icon: Leaf,
    iconClass: "text-green-600",
    title: "Clean & Organic",
    desc: "Pure natural ingredients. Free from harmful parabens, sulfates and toxins.",
  },
  {
    Icon: FlaskConical,
    iconClass: "text-blue-600",
    title: "Dermatologist Tested",
    desc: "Clinically tested by skin experts — safe and effective for all skin types.",
  },
  {
    Icon: PawPrint,
    iconClass: "text-purple-600",
    title: "Cruelty-Free",
    desc: "We love animals. No product or ingredient is ever tested on animals.",
  },
  {
    Icon: Gem,
    iconClass: "text-amber-600",
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
          <div className="flex h-full items-center justify-center opacity-30">
            <Sparkles size={48} className="text-rose-300" />
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
              Out of stock
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

export default async function Home() {
  // Direct MongoDB queries — no HTTP self-fetch (was silently failing on Vercel)
  const {
    settings,
    categories,
    hotOffers: rawHot,
    newArrivals: rawNew,
    fashionProducts: rawFashion,
    techProducts: rawTech,
    featuredCoupon,
  } = await getHomePageData();

  const hotOffers = rawHot.map(toCardProduct);
  const newArrivals = rawNew.map(toCardProduct);
  const fashionProducts = rawFashion.map(toCardProduct);
  const techProducts = rawTech.map(toCardProduct);

  const notice = settings.noticeBar;
  const topBanner = settings.promotionalBanner;
  const offer = settings.promoBanner;
  const couponLabel =
    featuredCoupon?.discountType === "percentage" && featuredCoupon.value != null
      ? `${featuredCoupon.value}% ছাড়`
      : featuredCoupon?.discountType === "fixed" && featuredCoupon.value != null
        ? `${formatBDT(featuredCoupon.value)} ছাড়`
        : "";

  return (
    <div className="min-h-screen bg-[#fdf8f9] text-slate-800">
      {/* Notice Bar — driven by SiteSettings.noticeBar */}
      {notice?.isActive && (
        <div
          className="py-2.5 text-center text-sm font-medium text-white"
          style={{ backgroundColor: notice.bgColor || "#e11d48" }}
        >
          {notice.text}
        </div>
      )}

      {settings.heroSection?.isVisible !== false && (
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
      )}

      <section className="relative z-10 -mt-8 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-rose-100 bg-white p-6 shadow-xl shadow-rose-100/40 sm:p-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {trustItems.map((item) => {
              const Icon = item.Icon;
              return (
                <div
                  key={item.title}
                  className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-50">
                    <Icon size={24} className="text-pink-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {topBanner?.isActive && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900">
            <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
              <div className="text-center lg:text-left">
                <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                  {topBanner.title}
                </h2>
                {topBanner.subtitle && (
                  <p className="mt-4 max-w-md text-base text-rose-100">{topBanner.subtitle}</p>
                )}
                {topBanner.buttonText && (
                  <Link
                    href={topBanner.buttonLink || "/shop"}
                    className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-rose-700 shadow-lg transition-all hover:scale-105 hover:bg-rose-50"
                  >
                    {topBanner.buttonText}
                  </Link>
                )}
              </div>
              {topBanner.imageUrl && (
                <div className="relative mx-auto h-56 w-full max-w-sm overflow-hidden rounded-2xl lg:h-64">
                  <Image
                    src={topBanner.imageUrl}
                    alt={topBanner.title || "Promotional banner"}
                    width={480}
                    height={320}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Categories — only isHomeVisible mains from DB */}
      {settings.categoriesSection?.isVisible !== false && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="mb-10 text-center font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
            Explore Categories
          </h2>
          {categories.length === 0 ? (
            <EmptyState message="No categories on home yet. Toggle Show on Home in Admin → Categories." />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                  className="group flex flex-col items-center rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-100/50"
                >
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-50 to-amber-50 transition-transform duration-300 group-hover:scale-110">
                    {cat.icon && cat.icon.length <= 4 ? (
                      <span className="text-3xl">{cat.icon}</span>
                    ) : (
                      <Sparkles size={32} className="text-rose-400" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-800 group-hover:text-rose-600">
                    {cat.name}
                  </h3>
                  {cat.count > 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      {cat.count} sub-categories
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}


      {settings.fashionSection?.isVisible !== false && (
        <section className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="font-serif text-3xl font-bold text-slate-900 sm:text-4xl">ফ্যাশন কালেকশন</h2>
              <Link href="/shop?dept=fashion" className="text-sm font-semibold text-rose-600 hover:underline">
                সব দেখো
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {fashionProducts.length === 0 ? (
                <EmptyState message="ফ্যাশন বিভাগে এখনো কোনো প্রোডাক্ট নেই।" />
              ) : (
                fashionProducts.map((product) => <ProductCard key={product.id} product={product} />)
              )}
            </div>
          </div>
        </section>
      )}

      {settings.techSection?.isVisible !== false && (
        <section className="bg-[#fdf8f9] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="font-serif text-3xl font-bold text-slate-900 sm:text-4xl">টেক কালেকশন</h2>
              <Link href="/shop?dept=tech" className="text-sm font-semibold text-rose-600 hover:underline">
                সব দেখো
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {techProducts.length === 0 ? (
                <EmptyState message="টেক বিভাগে এখনো কোনো প্রোডাক্ট নেই।" />
              ) : (
                techProducts.map((product) => <ProductCard key={product.id} product={product} />)
              )}
            </div>
          </div>
        </section>
      )}

      {/* Hot Offers — isHotOffer === true */}
      {settings.hotOffersSection?.isVisible !== false && (
        <section className="bg-gradient-to-br from-amber-50 via-rose-50 to-amber-50 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
                Hot Offers
              </h2>
              <Link href="/shop?hotOffer=true" className="hidden text-sm font-semibold text-rose-600 hover:underline sm:block">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hotOffers.length === 0 ? (
                <EmptyState message="No hot offers yet. Toggle Hot Offer on products in Admin → Products." />
              ) : (
                hotOffers.map((p) => <ProductCard key={p.id} product={p} />)
              )}
            </div>
          </div>
        </section>
      )}

      {offer?.isActive && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900">
            <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
              <div className="text-center lg:text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">অফার</p>
                <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
                  {offer.title}
                </h2>
                {offer.subtitle && (
                  <p className="mt-4 max-w-md text-base text-rose-100">{offer.subtitle}</p>
                )}
                {featuredCoupon?.code && (
                  <div className="mt-6 inline-flex flex-wrap items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-100">প্রোমো কোড</p>
                      <p className="font-mono text-xl font-bold text-white">{featuredCoupon.code}</p>
                      {couponLabel && <p className="text-xs text-rose-100">{couponLabel}</p>}
                    </div>
                    <CopyCodeButton code={featuredCoupon.code} />
                  </div>
                )}
                {offer.buttonText && (
                  <Link
                    href={offer.buttonLink || "/shop"}
                    className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-rose-700 shadow-lg transition-all hover:scale-105 hover:bg-rose-50"
                  >
                    {offer.buttonText}
                  </Link>
                )}
              </div>
              {offer.imageUrl && (
                <div className="relative mx-auto h-56 w-full max-w-sm overflow-hidden rounded-2xl lg:block">
                  <Image
                    src={offer.imageUrl}
                    alt={offer.title || "Offer"}
                    width={480}
                    height={320}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals — latest by createdAt */}
      {settings.newArrivalsSection?.isVisible !== false && (
        <section className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="font-serif text-3xl font-bold text-slate-900 sm:text-4xl">New Arrivals</h2>
              <Link href="/shop" className="hidden text-sm font-semibold text-rose-600 hover:underline sm:block">
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
      )}

      {settings.whyChooseUsSection?.isVisible !== false && (
        <section className="bg-[#fdf8f9] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="mb-12 text-center font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
              Why Choose Us?
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {whyChooseUs.map((item) => {
                const Icon = item.Icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-100/40"
                  >
                    <div className="mb-4 flex justify-center">
                      <Icon size={32} className={item.iconClass} />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-slate-800">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {settings.reviewsSection?.isVisible !== false && (
        <section id="reviews" className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="mb-12 text-center font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
              Loved by Thousands
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {reviews.map((r) => (
                <div key={r.name} className="rounded-3xl border border-rose-100 bg-[#fdf8f9] p-8 shadow-sm">
                  <div className="mb-4 flex gap-0.5 text-amber-400">
                    {[...Array(r.stars)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="mb-6 text-sm leading-relaxed text-slate-600">&ldquo;{r.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <Image
                      src={r.avatar}
                      alt={r.name}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover ring-2 ring-rose-100"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                      <p className="text-xs text-slate-500">{r.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-gradient-to-r from-rose-600 to-pink-600 py-14 text-center">
        <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">Ready to Glow?</h2>
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
