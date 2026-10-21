"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";

function formatBDT(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

export default function SearchBar({ autoFocus = false }) {
  const router = useRouter();
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const timer = useRef(null);
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const onPointer = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  useEffect(() => {
    const query = term.trim();
    if (timer.current) clearTimeout(timer.current);
    if (!query) {
      setResults([]);
      setLoading(false);
      setOpen(false);
      return undefined;
    }

    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products?q=${encodeURIComponent(query)}&limit=5`,
          { cache: "no-store" }
        );
        const data = await res.json().catch(() => null);
        setResults(Array.isArray(data?.products) ? data.products : []);
        setOpen(true);
      } catch {
        setResults([]);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer.current);
  }, [term]);

  const goToShop = () => {
    const query = term.trim();
    if (!query) return;
    setOpen(false);
    router.push(`/shop?search=${encodeURIComponent(query)}`);
  };

  return (
    <div ref={boxRef} className="relative w-full">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          goToShop();
        }}
      >
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rose-400"
        />
        <input
          ref={inputRef}
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          onFocus={() => {
            if (term.trim()) setOpen(true);
          }}
          placeholder="খুঁজুন... (যেমন: Serum, Lipstick)"
          aria-label="পণ্য খুঁজুন"
          className="w-full rounded-full border border-rose-100 bg-white py-2 pl-9 pr-9 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
        {loading && (
          <Loader2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-rose-400"
          />
        )}
      </form>

      {open && term.trim() && (
        <div className="absolute left-0 right-0 z-[60] mt-2 overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-xl">
          {results.length === 0 && !loading ? (
            <p className="px-4 py-3 text-sm text-slate-500">কোনো প্রোডাক্ট পাওয়া যায়নি</p>
          ) : (
            <ul>
              {results.slice(0, 5).map((product) => {
                const key = product.slug || product._id;
                const price =
                  product.discountPrice != null &&
                  Number(product.discountPrice) < Number(product.price)
                    ? product.discountPrice
                    : product.price;
                return (
                  <li key={product._id || key}>
                    <Link
                      href={`/product/${encodeURIComponent(key)}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-rose-50"
                    >
                      <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-rose-50">
                        {product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-800">
                          {product.name}
                        </span>
                        <span className="text-xs font-semibold text-rose-600">
                          {formatBDT(price)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
