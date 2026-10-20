"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Home,
  Ban,
  Search,
  Loader2,
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

function initialStatus(order, error) {
  if (order) return "success";
  if (!error) return "idle";
  if (/no order found/i.test(error)) return "not_found";
  return "error";
}

export default function TrackOrderClient({
  initialId = "",
  initialPhone = "",
  order = null,
  error = "",
}) {
  const [orderId, setOrderId] = useState(initialId);
  const [phone, setPhone] = useState(initialPhone);
  const [status, setStatus] = useState(() => initialStatus(order, error));
  const [result, setResult] = useState(order);
  const [message, setMessage] = useState(error);

  // Deep link / success-page navigation still hydrates the card without a spinner.
  useEffect(() => {
    setOrderId(initialId);
    setPhone(initialPhone);
    setResult(order);
    setMessage(error);
    setStatus(initialStatus(order, error));
  }, [initialId, initialPhone, order, error]);

  async function handleTrack(e) {
    e.preventDefault();
    const id = orderId.trim();
    const ph = phone.trim();
    if (!id && !ph) return;

    setStatus("loading");
    setResult(null);
    setMessage("");

    const params = new URLSearchParams();
    if (id) params.set("id", id);
    if (ph) params.set("phone", ph);

    try {
      const response = await fetch(`/api/orders/track?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await response.json().catch(() => null);

      if (response.ok && data?.success && data.order) {
        setResult(data.order);
        setStatus("success");
      } else if (response.status === 404 || /no order found/i.test(data?.message || "")) {
        setResult(null);
        setMessage(
          "We couldn't find an order with this ID/Phone. Please check and try again."
        );
        setStatus("not_found");
      } else {
        setResult(null);
        setMessage(data?.message || "Could not look up this order. Please try again.");
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setResult(null);
      setMessage("Could not look up this order. Please try again.");
      setStatus("error");
    }

    // Shareable URL without a navigation that would leave the button spinning.
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/track-order?${params.toString()}`);
    }
  }

  const loading = status === "loading";
  const shown = result;
  const cancelled = shown?.status === "cancelled";
  const currentIndex = STEPS.findIndex((s) => s.id === shown?.status);

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
        onSubmit={handleTrack}
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
              autoComplete="off"
              className="w-full rounded-xl border border-rose-100 px-4 py-3.5 font-mono text-base outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
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
              autoComplete="tel"
              className="w-full rounded-xl border border-rose-100 px-4 py-3.5 text-base outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-rose-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
          {loading ? "Searching..." : "Track Order"}
        </button>
      </form>

      <div className="mt-6 min-h-[4.5rem] transition-all">
        {status === "not_found" && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
            {message ||
              "We couldn't find an order with this ID/Phone. Please check and try again."}
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {message || "Could not look up this order. Please try again."}
          </div>
        )}

        {status === "success" && shown && (
          <article className="rounded-3xl border border-rose-100 bg-white p-6 shadow-xl shadow-rose-100/50 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Order
                </p>
                <p className="mt-1 break-all font-mono text-sm font-bold text-rose-600">
                  {shown.id}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  cancelled ? "bg-red-50 text-red-700" : "bg-rose-50 text-rose-700"
                }`}
              >
                {cancelled ? "Cancelled" : STEPS[currentIndex]?.label || shown.status}
              </span>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs text-slate-400">Customer</dt>
                <dd className="font-medium text-slate-800">{shown.customerName}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Items</dt>
                <dd className="font-medium text-slate-800">{shown.itemsCount}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Total</dt>
                <dd className="font-semibold text-rose-600">{formatBDT(shown.total)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Last updated</dt>
                <dd className="font-medium text-slate-800">{formatWhen(shown.updatedAt)}</dd>
              </div>
            </dl>

            {shown.estimatedDelivery && !cancelled && shown.status !== "delivered" && (
              <p className="mt-4 text-sm text-slate-600">
                Estimated delivery:{" "}
                <span className="font-semibold text-slate-800">
                  {formatWhen(shown.estimatedDelivery).replace(/, \d{2}:\d{2}$/, "")}
                </span>
              </p>
            )}

            {shown.trackingNumber && (
              <p className="mt-2 text-sm text-slate-600">
                Tracking number:{" "}
                <span className="font-mono font-semibold text-slate-800">
                  {shown.trackingNumber}
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
                            className={`my-1 w-0.5 min-h-[28px] flex-1 ${
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
    </div>
  );
}
