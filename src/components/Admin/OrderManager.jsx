"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, X, ShoppingBag } from "lucide-react";

function formatBDT(n) {
  return `৳${Number(n || 0).toLocaleString("en-BD")}`;
}

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_LABEL = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  confirmed: "bg-blue-50 text-blue-800 border-blue-200",
  processing: "bg-indigo-50 text-indigo-800 border-indigo-200",
  shipped: "bg-violet-50 text-violet-800 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-50 text-red-800 border-red-200",
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json().catch(() => null);
      if (data?.success) setOrders(data.orders || []);
    } catch {
      setMessage({ type: "error", text: "Failed to load orders" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    setMessage(null);
    try {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status } : o))
        );
        setMessage({ type: "success", text: `Status updated to ${STATUS_LABEL[status]}` });
      } else {
        setMessage({ type: "error", text: data?.message || "Update failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-800">
          Orders ({orders.length})
        </h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === f.id
                ? "bg-pink-600 text-white"
                : "bg-white text-slate-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.label}
            {f.id !== "all" && (
              <span className="ml-1 opacity-70">
                ({orders.filter((o) => o.status === f.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-2.5 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-slate-500">
            <ShoppingBag size={32} className="mb-2 text-slate-300" />
            <p className="text-sm">No orders found.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50 text-slate-500">
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o._id} className="border-b border-gray-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500" dir="ltr">
                    {String(o._id).slice(-8)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{o.customerName}</td>
                  <td className="px-4 py-3 text-slate-600" dir="ltr">{o.phone}</td>
                  <td className="px-4 py-3 font-semibold text-pink-600">
                    {formatBDT(o.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      disabled={updatingId === o._id}
                      onChange={(e) => changeStatus(o._id, e.target.value)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-50 ${
                        STATUS_STYLE[o.status] || "bg-gray-50"
                      }`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setDetail(o)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-pink-50 hover:text-pink-600"
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">Order Details</h3>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded-lg p-1.5 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Order ID</p>
                  <p className="font-mono text-slate-700" dir="ltr">{detail._id}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      STATUS_STYLE[detail.status] || ""
                    }`}
                  >
                    {STATUS_LABEL[detail.status] || detail.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Customer</p>
                  <p className="font-medium text-slate-800">{detail.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="text-slate-700" dir="ltr">{detail.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">Shipping Address</p>
                  <p className="text-slate-700">{detail.address}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Date</p>
                  <p className="text-slate-700">
                    {detail.createdAt
                      ? new Date(detail.createdAt).toLocaleString("en-GB")
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="text-lg font-bold text-pink-600">
                    {formatBDT(detail.totalAmount)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-800">Items</h4>
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                  {(detail.items || []).map((item, i) => (
                    <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-400">
                          {formatBDT(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-slate-700">
                        {formatBDT(item.price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setDetail(null)}
                  className="rounded-xl bg-slate-100 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
