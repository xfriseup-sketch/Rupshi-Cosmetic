"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Format a number as Bangladeshi Taka, e.g. ৳1,200 */
function formatBDT(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

// Preset price ranges (shown as radio options in the sidebar)
const PRICE_PRESETS = [
  { key: "all", label: "সব রেঞ্জ", min: "", max: "" },
  { key: "under500", label: "৫০০ টাকার কম", min: "", max: "499" },
  { key: "500-1000", label: "৫০০ - ১০০০ টাকা", min: "500", max: "1000" },
  { key: "1000-2000", label: "১০০০ - ২০০০ টাকা", min: "1000", max: "2000" },
  { key: "over2000", label: "২০০০+ টাকা", min: "2000", max: "" },
];

const SORT_OPTIONS = [
  { key: "newest", label: "নতুন আগে" },
  { key: "price-asc", label: "দাম কম → বেশি" },
  { key: "price-desc", label: "দাম বেশি → কম" },
];

/** Build a nested tree [{ ...cat, children: [...] }] from a flat list */
function nestCategories(flat) {
  const byId = new Map(flat.map((c) => [c._id, { ...c, children: [] }]));
  const roots = [];
  for (const node of byId.values()) {
    const parentId = node.parentCategory ? String(node.parentCategory) : null;
    if (parentId && byId.has(parentId)) byId.get(parentId).children.push(node);
    else roots.push(node);
  }
  return roots;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

/** Next.js requires useSearchParams() to sit inside a <Suspense> boundary. */
export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <Navbar active="shop" />
          <p className="py-24 text-center text-gray-500 animate-pulse">লোড হচ্ছে...</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const { addToCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ---- data ----
  const [products, setProducts] = useState(null); // null = loading
  const [count, setCount] = useState(0);
  const [dbNotConfigured, setDbNotConfigured] = useState(false);
  const [categories, setCategories] = useState([]); // flat list
  const [brands, setBrands] = useState([]); // unique brand names

  // ---- filters (single source of truth: URL query params) ----
  const selectedCategories = useMemo(
    () => (searchParams.get("category") ? searchParams.get("category").split(",").filter(Boolean) : []),
    [searchParams]
  );
  const selectedBrands = useMemo(
    () => (searchParams.get("brand") ? searchParams.get("brand").split(",").filter(Boolean) : []),
    [searchParams]
  );
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "newest";

  // ---- mobile filter drawer ----
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Debounced fetch so checkbox spam doesn't hammer the API
  const fetchTimer = useRef(null);
  const loadProducts = useCallback(
    (params) => {
      if (fetchTimer.current) clearTimeout(fetchTimer.current);
      fetchTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/products?${params.toString()}`);
          const data = await res.json().catch(() => null);

          if (res.status === 503 || data?.dbConfigured === false) {
            setDbNotConfigured(true);
            setProducts([]);
            return;
          }
          if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

          setDbNotConfigured(false);
          setProducts(data?.products ?? []);
          setCount(data?.count ?? 0);
        } catch (error) {
          console.error("Failed to fetch products:", error);
          setProducts([]);
        }
      }, 250);
    },
    []
  );

  // Fetch whenever the URL query changes (URL is the state store)
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategories.length) params.set("category", selectedCategories.join(","));
    if (selectedBrands.length) params.set("brand", selectedBrands.join(","));
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    params.set("sort", sort);
    loadProducts(params);
  }, [selectedCategories, selectedBrands, minPrice, maxPrice, sort, loadProducts]);

  // Load categories (nested tree) + derive brand list once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json().catch(() => null);
        if (!cancelled && data?.success) setCategories(data.categories || []);
      } catch {
        /* ignore — sidebar just stays empty */
      }
    })();
    (async () => {
      try {
        // Derive unique brands from all products (no filters)
        const res = await fetch("/api/products");
        const data = await res.json().catch(() => null);
        if (!cancelled && data?.success) {
          const uniq = [...new Set((data.products || []).map((p) => p.brand).filter(Boolean))];
          setBrands(uniq.sort());
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Push updated filters into the URL — this triggers the fetch above. */
  const updateFilters = (next) => {
    const params = new URLSearchParams(searchParams.toString());

    const setList = (key, list) => {
      if (list.length > 0) params.set(key, list.join(","));
      else params.delete(key);
    };

    if (next.category !== undefined) setList("category", next.category);
    if (next.brand !== undefined) setList("brand", next.brand);
    if (next.minPrice !== undefined) {
      next.minPrice ? params.set("minPrice", next.minPrice) : params.delete("minPrice");
    }
    if (next.maxPrice !== undefined) {
      next.maxPrice ? params.set("maxPrice", next.maxPrice) : params.delete("maxPrice");
    }
    if (next.sort !== undefined) {
      next.sort && next.sort !== "newest" ? params.set("sort", next.sort) : params.delete("sort");
    }

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const toggleInList = (list, value) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const clearAll = () => {
    router.push(pathname, { scroll: false });
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    Boolean(minPrice) ||
    Boolean(maxPrice);

  const catTree = useMemo(() => nestCategories(categories), [categories]);
  const nameById = useMemo(() => {
    const m = {};
    categories.forEach((c) => (m[c._id] = c.name));
    return m;
  }, [categories]);

  // Active filter chips
  const activeChips = [
    ...selectedCategories.map((slugOrName) => ({
      key: `c-${slugOrName}`,
      label: `ক্যাটাগরি: ${categories.find((c) => c.slug === slugOrName || c.name === slugOrName)?.name || slugOrName}`,
      onRemove: () =>
        updateFilters({ category: selectedCategories.filter((v) => v !== slugOrName) }),
    })),
    ...selectedBrands.map((b) => ({
      key: `b-${b}`,
      label: `ব্র্যান্ড: ${b}`,
      onRemove: () => updateFilters({ brand: selectedBrands.filter((v) => v !== b) }),
    })),
    ...(minPrice || maxPrice
      ? [
          {
            key: "price",
            label: `দাম: ${minPrice ? formatBDT(minPrice) : "৳০"} – ${maxPrice ? formatBDT(maxPrice) : "∞"}`,
            onRemove: () => updateFilters({ minPrice: "", maxPrice: "" }),
          },
        ]
      : []),
  ];

  const pricePresetKey =
    PRICE_PRESETS.find((p) => p.min === minPrice && p.max === maxPrice)?.key || "custom";

  /* ------------------------- sidebar content ------------------------ */
  const sidebar = (
    <div className="space-y-6">
      {/* Category tree */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">
          🏷️ ক্যাটাগরি
        </h3>
        {catTree.length === 0 ? (
          <p className="text-sm text-gray-400">কোনো ক্যাটাগরি নেই</p>
        ) : (
          <div className="space-y-1">
            {catTree.map((main) => (
              <div key={main._id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-800 hover:bg-pink-50">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(main.slug)}
                    onChange={() =>
                      updateFilters({
                        category: toggleInList(selectedCategories, main.slug),
                      })
                    }
                    className="h-4 w-4 accent-[#db2777]"
                  />
                  <span>{main.icon} {main.name}</span>
                </label>
                {/* Nested sub-categories (indented) */}
                {main.children.length > 0 && (
                  <div className="ml-6 border-l border-pink-100 pl-2">
                    {main.children.map((sub) => (
                      <label
                        key={sub._id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-pink-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(sub.slug)}
                          onChange={() =>
                            updateFilters({
                              category: toggleInList(selectedCategories, sub.slug),
                            })
                          }
                          className="h-4 w-4 accent-[#db2777]"
                        />
                        <span>{sub.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Brand filter */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">
          ✨ ব্র্যান্ড
        </h3>
        {brands.length === 0 ? (
          <p className="text-sm text-gray-400">কোনো ব্র্যান্ড নেই</p>
        ) : (
          <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
            {brands.map((b) => (
              <label
                key={b}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-pink-50"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b)}
                  onChange={() => updateFilters({ brand: toggleInList(selectedBrands, b) })}
                  className="h-4 w-4 accent-[#db2777]"
                />
                <span className="truncate">{b}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price range presets */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">
          💰 দামের রেঞ্জ
        </h3>
        <div className="space-y-1">
          {PRICE_PRESETS.map((p) => (
            <label
              key={p.key}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-pink-50"
            >
              <input
                type="radio"
                name="priceRange"
                checked={pricePresetKey === p.key}
                onChange={() => updateFilters({ minPrice: p.min, maxPrice: p.max })}
                className="h-4 w-4 accent-[#db2777]"
              />
              <span>{p.label}</span>
            </label>
          ))}
        </div>

        {/* Custom min/max inputs */}
        <CustomPriceForm
          minPrice={minPrice}
          maxPrice={maxPrice}
          onSubmit={(mn, mx) => updateFilters({ minPrice: mn, maxPrice: mx })}
        />
      </div>
    </div>
  );

  /* ------------------------------ render ---------------------------- */
  return (
    <main className="min-h-screen bg-pink-50">
      <Navbar active="shop" />

      {/* Shop Header */}
      <section className="bg-gradient-to-br from-pink-100 via-pink-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            আমাদের <span className="text-[#db2777]">কালেকশন</span>
          </h1>
          <p className="mt-3 text-gray-600">
            স্কিনকেয়ার, মেকআপ, হেয়ারকেয়ার ও ফ্র্যাগ্রেন্স — সব কিছু এক জায়গায়
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        {/* Mobile filter button */}
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-semibold text-[#db2777] shadow-sm"
          >
            ⚙️ ফিল্টার
            {hasActiveFilters && (
              <span className="rounded-full bg-[#db2777] px-2 py-0.5 text-xs text-white">
                {activeChips.length}
              </span>
            )}
          </button>
          <SortDropdown sort={sort} onChange={(s) => updateFilters({ sort: s })} />
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">ফিল্টার</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearAll}
                    className="text-xs font-semibold text-[#db2777] hover:underline"
                  >
                    সব মুছুন ✕
                  </button>
                )}
              </div>
              {sidebar}
            </div>
          </aside>

          {/* Main column */}
          <div className="min-w-0 flex-1">
            {/* Toolbar (desktop): count + sort */}
            <div className="mb-4 hidden items-center justify-between lg:flex">
              <h2 className="text-2xl font-bold text-gray-900">
                {products === null
                  ? "লোড হচ্ছে..."
                  : `মোট ${count}টি পণ্য`}
              </h2>
              <SortDropdown sort={sort} onChange={(s) => updateFilters({ sort: s })} />
            </div>

            {/* Active filters bar */}
            {activeChips.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-pink-100 bg-white px-4 py-3 shadow-sm">
                <span className="text-sm font-semibold text-gray-700">🔎 সক্রিয় ফিল্টার:</span>
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={chip.onRemove}
                    className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-[#9d174d] hover:bg-pink-200"
                    title="অপসারণ করুন"
                  >
                    {chip.label}
                    <span aria-hidden>✕</span>
                  </button>
                ))}
                <button
                  onClick={clearAll}
                  className="ml-auto rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  সব Clear All
                </button>
              </div>
            )}

            {/* States */}
            {products === null ? (
              <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-[#db2777]" />
                <p className="text-xl font-semibold text-[#db2777]">লোড হচ্ছে...</p>
              </div>
            ) : products.length === 0 && dbNotConfigured ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-pink-200 bg-white px-6 py-16 text-center shadow-sm">
                <span className="text-5xl">🗄️</span>
                <p className="text-xl font-semibold text-[#db2777]">
                  ডাটাবেস কনফিগার করা হয়নি। দয়া করে অ্যাডমিন প্যানেল থেকে MONGODB_URI সেট করুন।
                </p>
                <Link
                  href="/admin"
                  className="mt-4 rounded-full bg-[#db2777] px-6 py-2 font-semibold text-white transition-colors hover:bg-[#9d174d]"
                >
                  অ্যাডমিন প্যানেলে যাও
                </Link>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-pink-200 bg-white px-6 py-20 text-center shadow-sm">
                <span className="text-5xl">🔍</span>
                <p className="text-xl font-semibold text-gray-700">
                  এই ফিল্টারে কোনো প্রোডাক্ট পাওয়া যায়নি
                </p>
                <p className="text-sm text-gray-500">ফিল্টার বদলে আবার চেষ্টা করুন 💕</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAll}
                    className="mt-4 rounded-full bg-[#db2777] px-6 py-2 font-semibold text-white transition-colors hover:bg-[#9d174d]"
                  >
                    ফিল্টার মুছে ফেলো
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile count */}
                <div className="mb-4 flex items-center justify-between lg:hidden">
                  <h2 className="text-lg font-bold text-gray-900">মোট {count}টি পণ্য</h2>
                </div>

                {/* Grid: 2 mobile / 3 tablet / 4 desktop */}
                <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} onAdd={addToCart} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">ফিল্টার</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 rounded-full bg-pink-50 text-[#db2777] font-bold hover:bg-pink-100"
                aria-label="বন্ধ করুন"
              >
                ✕
              </button>
            </div>
            {sidebar}
            <div className="mt-6 flex gap-3">
              <button
                onClick={clearAll}
                className="flex-1 rounded-full border border-pink-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#db2777]"
              >
                সব মুছুন
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex-1 rounded-full bg-[#db2777] px-4 py-2.5 text-sm font-semibold text-white"
              >
                ফলাফল দেখুন ({count})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#9d174d] py-8 text-center text-pink-100">
        <p className="text-lg font-semibold">রূপসী - কসমেটিক শপ</p>
        <p className="mt-2 text-sm">© ২০২৬ রূপসী। সর্বস্বত্ব সংরক্ষিত।</p>
      </footer>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Sort dropdown                                                       */
/* ------------------------------------------------------------------ */
function SortDropdown({ sort, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-600">
      <span className="hidden font-medium sm:inline">সাজান:</span>
      <select
        value={sort}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#db2777]"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Custom min/max price form                                           */
/* ------------------------------------------------------------------ */
function CustomPriceForm({ minPrice, maxPrice, onSubmit }) {
  const [mn, setMn] = useState(minPrice);
  const [mx, setMx] = useState(maxPrice);

  useEffect(() => {
    setMn(minPrice);
    setMx(maxPrice);
  }, [minPrice, maxPrice]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(mn.trim(), mx.trim());
      }}
      className="mt-3 flex items-center gap-2"
    >
      <input
        type="number"
        min="0"
        value={mn}
        onChange={(e) => setMn(e.target.value)}
        placeholder="সর্বনিম্ন"
        className="w-full rounded-lg border border-pink-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#db2777]"
      />
      <span className="text-gray-400">—</span>
      <input
        type="number"
        min="0"
        value={mx}
        onChange={(e) => setMx(e.target.value)}
        placeholder="সর্বোচ্চ"
        className="w-full rounded-lg border border-pink-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#db2777]"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-[#db2777] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#9d174d]"
      >
        ✓
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Product card (Phase 6 spec)                                         */
/* ------------------------------------------------------------------ */
/** Detail-page URL: prefer slug, fall back to _id (legacy products) */
export function productHref(product) {
  const key = product.slug || product._id;
  return `/product/${encodeURIComponent(key)}`;
}

function ProductCard({ product, onAdd }) {
  const hasDiscount =
    product.discountPrice != null && Number(product.discountPrice) < Number(product.price);
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-[#db2777] hover:shadow-lg">
      {/* Image (links to the product detail page) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-pink-100">
      <Link href={productHref(product)} className="absolute inset-0 z-0 block" aria-label={product.name}>
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 45vw, (max-width: 1280px) 30vw, 22vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">💄</div>
        )}

        {/* Badges — top corner */}
        <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
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

        {/* Out-of-stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-red-600">
              স্টক নেই
            </span>
          </div>
        )}

      </Link>

        {/* Quick Add — slides up on hover (desktop only) */}
        <button
          type="button"
          disabled={!product.inStock}
          onClick={() => onAdd(product)}
          className="absolute inset-x-0 bottom-0 z-20 translate-y-full bg-[#db2777] py-2.5 text-sm font-semibold text-white opacity-0 transition-all duration-300 hover:bg-[#9d174d] group-hover:translate-y-0 group-hover:opacity-100 disabled:bg-gray-400 max-lg:hidden"
        >
          ⚡ কার্টে যোগ করো
        </button>
      </div>

      {/* Details */}
      <div className="relative z-10 flex flex-1 flex-col p-3 sm:p-4">
        {product.brand && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
            {product.brand}
          </p>
        )}
        <h3 className="mt-0.5 line-clamp-2 text-sm font-bold text-gray-900 group-hover:text-[#db2777] sm:text-base">
          <Link href={productHref(product)}>{product.name}</Link>
        </h3>

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-base font-extrabold text-[#db2777] sm:text-lg">
                {formatBDT(product.discountPrice)}
              </span>
              <span className="text-xs text-gray-400 line-through sm:text-sm">
                {formatBDT(product.price)}
              </span>
            </>
          ) : (
            <span className="text-base font-bold text-[#db2777] sm:text-lg">
              {formatBDT(product.price)}
            </span>
          )}
        </div>

        {/* Mobile add button (Quick Add hover is desktop-only) */}
        <button
          type="button"
          disabled={!product.inStock}
          onClick={() => onAdd(product)}
          className="mt-3 w-full rounded-full bg-[#db2777] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9d174d] disabled:cursor-not-allowed disabled:bg-gray-300 lg:hidden"
        >
          কার্টে যোগ করো
        </button>
      </div>
    </article>
  );
}
