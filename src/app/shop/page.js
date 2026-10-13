import Link from "next/link";
import Image from "next/image";

// Category badge colors & Bengali labels
const categoryMeta = {
  Skincare: { bn: "স্কিনকেয়ার", badge: "bg-pink-100 text-[#db2777]" },
  Makeup: { bn: "মেকআপ", badge: "bg-rose-100 text-rose-700" },
  Haircare: { bn: "হেয়ারকেয়ার", badge: "bg-fuchsia-100 text-fuchsia-700" },
  Fragrance: { bn: "ফ্র্যাগ্রেন্স", badge: "bg-purple-100 text-purple-700" },
};

/**
 * Fetch products server-side (no client-side fetching for initial load).
 */
async function getProducts() {
  try {
    // In server components during rendering, absolute URLs need the host header
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/products`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.products ?? [];
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return null;
  }
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-pink-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-2xl font-bold text-[#db2777]">
            রূপসী
          </Link>
          <div className="flex items-center gap-6 text-base font-medium">
            <Link
              href="/"
              className="text-gray-700 hover:text-[#db2777] transition-colors"
            >
              হোম
            </Link>
            <Link
              href="/shop"
              className="text-[#db2777] hover:text-[#9d174d] transition-colors"
            >
              দোকান
            </Link>
            <Link
              href="/cart"
              className="text-gray-700 hover:text-[#db2777] transition-colors"
            >
              🛒 কার্ট
            </Link>
          </div>
        </div>
      </nav>

      {/* Shop Header */}
      <section className="bg-gradient-to-br from-pink-100 via-pink-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            আমাদের <span className="text-[#db2777]">কালেকশন</span>
          </h1>
          <p className="mt-3 text-gray-600">
            স্কিনকেয়ার, মেকআপ, হেয়ারকেয়ার ও ফ্র্যাগ্রেন্স — সব কিছু এক জায়গায়
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        {products === null ? (
          // Loading state (shown while fetching)
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-[#db2777]" />
            <p className="text-xl font-semibold text-[#db2777]">লোড হচ্ছে...</p>
          </div>
        ) : products.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <span className="text-5xl">🛍️</span>
            <p className="text-xl font-semibold text-gray-700">
              কোনো প্রোডাক্ট পাওয়া যায়নি
            </p>
            <p className="text-sm text-gray-500">
              শীঘ্রই নতুন পণ্য যোগ করা হবে। ধৈর্য ধরুন 💕
            </p>
            <Link
              href="/"
              className="mt-4 rounded-full bg-[#db2777] px-6 py-2 font-semibold text-white transition-colors hover:bg-[#9d174d]"
            >
              হোমে ফিরে যাও
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                সকল প্রোডাক্ট
              </h2>
              <span className="rounded-full bg-pink-100 px-4 py-1 text-sm font-semibold text-[#db2777]">
                মোট {products.length}টি পণ্য
              </span>
            </div>

            {/* Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const meta = categoryMeta[product.category] ?? {
                  bn: product.category,
                  badge: "bg-pink-100 text-[#db2777]",
                };
                const price = new Intl.NumberFormat("bn-BD").format(
                  product.price
                );

                return (
                  <article
                    key={product._id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-[#db2777] hover:shadow-lg"
                  >
                    {/* Product image */}
                    <div className="relative aspect-square w-full overflow-hidden bg-pink-100">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-5xl">
                          💄
                        </div>
                      )}
                      {!product.inStock && (
                        <span className="absolute left-3 top-3 rounded-full bg-gray-800/80 px-3 py-1 text-xs font-semibold text-white">
                          স্টক নেই
                        </span>
                      )}
                    </div>

                    {/* Product details */}
                    <div className="flex flex-1 flex-col p-5">
                      <span
                        className={`mb-2 self-start rounded-full px-3 py-1 text-xs font-semibold ${meta.badge}`}
                      >
                        {meta.bn}
                      </span>

                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#db2777]">
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-1 items-end justify-between gap-3">
                        <p className="text-xl font-extrabold text-[#db2777]">
                          ৳{price}
                        </p>
                        <button
                          type="button"
                          disabled={!product.inStock}
                          className="rounded-full bg-[#db2777] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#9d174d] disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          কার্টে যোগ করো
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-[#9d174d] py-8 text-center text-pink-100">
        <p className="text-lg font-semibold">রূপসী - কসমেটিক শপ</p>
        <p className="mt-2 text-sm">© ২০২৬ রূপসী। সর্বস্বত্ব সংরক্ষিত।</p>
      </footer>
    </main>
  );
}
