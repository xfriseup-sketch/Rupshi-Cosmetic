import Link from "next/link";
import Image from "next/image";

/** Format a number as Bangladeshi Taka, e.g. ৳1,200 */
export function formatBDT(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

/**
 * Premium product card — soft shadows, elegant hover lift, refined badges
 */
export default function ProductCard({ product }) {
  const hasDiscount =
    product.discountPrice != null &&
    Number(product.discountPrice) < Number(product.price);
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-rose-100/70 bg-white shadow-[0_4px_20px_-8px_rgba(219,39,119,0.12)] transition-all duration-400 hover:-translate-y-1.5 hover:border-rose-200 hover:shadow-[0_12px_32px_-8px_rgba(219,39,119,0.22)]">
      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-b from-rose-50 to-pink-50/50">
        <Link
          href={`/product/${encodeURIComponent(product.slug || product._id)}`}
          className="absolute inset-0 z-0 block"
          aria-label={product.name}
        >
          {product.image ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 45vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl opacity-40">
              💄
            </div>
          )}

          {/* Soft gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Badges */}
          {product.isNew && (
            <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow-lg shadow-blue-200/50">
              NEW
            </span>
          )}
          {hasDiscount && (
            <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow-lg shadow-rose-200/50">
              -{discountPct}%
            </span>
          )}

          {/* Out of stock overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
              <span className="rounded-full bg-white/95 px-4 py-1.5 text-sm font-bold text-rose-600 shadow">
                স্টক নেই
              </span>
            </div>
          )}
        </Link>

        {/* Quick Add — slides up on desktop hover */}
        {product.inStock && (
          <div className="absolute inset-x-0 bottom-0 hidden translate-y-full p-3 transition-transform duration-400 ease-out group-hover:translate-y-0 md:block">
            <Link
              href={`/shop?add=${encodeURIComponent(product._id)}`}
              className="block w-full rounded-xl bg-white/95 py-3 text-center text-sm font-semibold text-slate-800 shadow-lg backdrop-blur transition-all hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-600 hover:text-white"
            >
              কার্টে যোগ করো
            </Link>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="relative z-10 flex flex-1 flex-col p-4 sm:p-5">
        {product.brand && (
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-400">
            {product.brand}
          </p>
        )}
        <h3 className="mb-3 line-clamp-2 min-h-[2.5em] text-sm font-semibold leading-snug text-slate-800 transition-colors group-hover:text-rose-600 sm:text-[15px]">
          <Link href={`/product/${encodeURIComponent(product.slug || product._id)}`}>
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-lg font-bold text-rose-600 sm:text-xl">
                {formatBDT(product.discountPrice)}
              </span>
              <span className="text-sm font-medium text-slate-400 line-through">
                {formatBDT(product.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-slate-800 sm:text-xl">
              {formatBDT(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
