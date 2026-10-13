"use client";

import { useCart } from "@/context/CartContext";

/**
 * Simple toast notification rendered globally (inside CartProvider).
 * Auto-dismisses after 3 seconds (handled in CartContext).
 */
export default function Toast() {
  const { toast } = useCart();

  if (!toast) return null;

  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[100] animate-toast-in"
    >
      <div className="flex items-center gap-3 rounded-full bg-[#db2777] px-6 py-3 text-white shadow-xl ring-1 ring-[#9d174d]/30">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-base">
          ✅
        </span>
        <p className="whitespace-nowrap text-sm font-semibold md:text-base">
          {toast.message}
        </p>
      </div>
    </div>
  );
}
