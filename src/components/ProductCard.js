import Link from "next/link";
import Image from "next/image";

// Primary palette (professional fashion-store look)
const PINK = "#ec4899";

/** Format a number as Bangladeshi Taka, e.g. ৳1,200 */
export function formatBDT(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

/**
 * Product card per Phase 6/7.5 spec:
 * white container + gray-100 border → hover pink-200 border,
 * aspect-[3/4] image zooming on hover, NEW badge (blue, top-left),
 * SALE badge (red, top-right), brand small uppercase gray,
 * line-clamp-2 title, bold pink discounted price + strikethrough original,
 * Quick Add button hidden on mobile, slides up from bottom on desktop hover,
 * out-of-stock overlay with "স্টক নেই".
 */
export default function ProductCard({ product }) {
  const hasDiscount =
    product.discountPrice != null &&
    Number(product.discountPrice) < Number(product.price);
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-pink-200 hover:shadow-lg">
      {/* Image (links to the product detail page) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-pink-50">
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
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl">
              💄
            </div>
          )}

          {/* Badges — corners */}
          {product.isNew && (
            <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow">
              NEW
            </span>
          )}
          {hasDiscount && (
            <span className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow">
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
          <div className="absolute inset-x-0 bottom-0 hidden translate-y-full p-3 transition-transform duration-300 ease-out group-hover:translate-y-0 md:block">
            <Link
              href={`/shop?add=${encodeURIComponent(product._id)}`}
              className="block w-full rounded-lg bg-white py-3 text-center text-sm font-semibold text-gray-900 shadow-lg transition-colors hover:bg-pink-600 hover:text-white"
            >
              কার্টে যোগ করো
            </Link>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="relative z-10 p-5">
        {product.brand && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {product.brand}
          </p>
        )}
        <h3 className="mb-3 line-clamp-2 min-h-[2.6em] text-sm font-bold leading-snug text-gray-900 group-hover:text-[#ec4899] sm:text-base">
          <Link href={`/product/${encodeURIComponent(product.slug || product._id)}`}>
            {product.name}
          </Link>
        </h3>
        <div className="flex flex-wrap items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-xl font-bold" style={{ color: PINK }}>
                {formatBDT(product.discountPrice)}
              </span>
              <span className="text-sm font-medium text-gray-400 line-through">
                {formatBDT(product.price)}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-gray-900">
              {formatBDT(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
