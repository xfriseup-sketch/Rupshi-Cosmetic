"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Home,
  Ban,
  Search,
} from "lucide-react";

const STEPS = [
  { id: "pending", label: "Pending", Icon: Clock },
  { id: "confirmed", label: "Confirmed", Icon: CheckCircle2 },
  { id: "processing", label: "Processing", Icon: Package },
  { id: "shipped", label: "Shipped", Icon: Truck },
  { id: "delivered", label: "Delivered", Icon: Home },
];

function formatBDT(n) {
  return `৳${Number(n || 0).toLocaleString("en-BD")}`;
}

function formatWhen(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TrackOrderClient({ initialId = "", initialPhone = "", order = null, error = "" }) {
  const router = useRouter();
  const [orderId, setOrderId] = useState(initialId);
  const [phone, setPhone] = useState(initialPhone);
  const [pending, setPending] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    const id = orderId.trim();
    const ph = phone.trim();
    if (!id && !ph) return;
    setPending(true);
    const params = new URLSearchParams();
    if (id) params.set("id", id);
    if (ph) params.set("phone", ph);
    router.push(`/track-order?${params.toString()}`);
  };

  const cancelled = order?.status === "cancelled";
  const currentIndex = STEPS.findIndex((s) => s.id === order?.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
          Rupshi Cosmetics
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
          Track Your Order
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your order ID or the phone number used at checkout.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-3xl border border-rose-100 bg-white p-5 shadow-lg shadow-rose-100/40 sm:p-6"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="orderId" className="mb-1 block text-xs font-semibold text-slate-600">
              Order ID
            </label>
            <input
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Paste order ID"
              className="w-full rounded-xl border border-rose-100 px-3 py-2.5 font-mono text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-xs font-semibold text-slate-600">
              Phone Number
            </label>
            <input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              inputMode="tel"
              className="w-full rounded-xl border border-rose-100 px-3 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-600 py-3 text-sm font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 disabled:opacity-60"
        >
          {pending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <Search size={16} />
          )}
          {pending ? "Searching..." : "Track Order"}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      {order && (
        <article className="mt-8 rounded-3xl border border-rose-100 bg-white p-6 shadow-xl shadow-rose-100/50 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Order
              </p>
              <p className="mt-1 break-all font-mono text-sm font-bold text-rose-600">
                {order.id}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                cancelled
                  ? "bg-red-50 text-red-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {cancelled ? "Cancelled" : STEPS[currentIndex]?.label || order.status}
            </span>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-slate-400">Customer</dt>
              <dd className="font-medium text-slate-800">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Items</dt>
              <dd className="font-medium text-slate-800">{order.itemsCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Total</dt>
              <dd className="font-semibold text-rose-600">{formatBDT(order.total)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Last updated</dt>
              <dd className="font-medium text-slate-800">{formatWhen(order.updatedAt)}</dd>
            </div>
          </dl>

          {order.estimatedDelivery && !cancelled && order.status !== "delivered" && (
            <p className="mt-4 text-sm text-slate-600">
              Estimated delivery:{" "}
              <span className="font-semibold text-slate-800">
                {formatWhen(order.estimatedDelivery).replace(/, \d{2}:\d{2}$/, "")}
              </span>
            </p>
          )}

          {order.trackingNumber && (
            <p className="mt-2 text-sm text-slate-600">
              Tracking number:{" "}
              <span className="font-mono font-semibold text-slate-800">
                {order.trackingNumber}
              </span>
            </p>
          )}

          {cancelled ? (
            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
              <Ban className="text-red-500" size={22} />
              <div>
                <p className="font-semibold text-red-700">This order was cancelled</p>
                <p className="text-sm text-red-600">Contact support if this looks wrong.</p>
              </div>
            </div>
          ) : (
            <ol className="mt-8 space-y-0">
              {STEPS.map((step, index) => {
                const done = currentIndex >= index;
                const current = currentIndex === index;
                const Icon = step.Icon;
                const last = index === STEPS.length - 1;
                return (
                  <li key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                          done
                            ? "border-rose-600 bg-rose-600 text-white"
                            : "border-rose-100 bg-white text-rose-200"
                        } ${current ? "ring-4 ring-rose-100" : ""}`}
                      >
                        <Icon size={18} />
                      </span>
                      {!last && (
                        <span
                          className={`my-1 w-0.5 flex-1 min-h-[28px] ${
                            currentIndex > index ? "bg-rose-500" : "bg-rose-100"
                          }`}
                        />
                      )}
                    </div>
                    <div className={`pb-6 pt-2 ${last ? "pb-0" : ""}`}>
                      <p
                        className={`text-sm font-semibold ${
                          done ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {step.label}
                        {current ? " · Current" : ""}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </article>
      )}
    </div>
  );
}
