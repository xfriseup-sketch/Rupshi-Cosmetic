"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Ticket, X } from "lucide-react";

function formatBDT(n) {
  return `৳${Number(n || 0).toLocaleString("en-BD")}`;
}

function isExpired(expiryDate) {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
}

const emptyForm = {
  code: "",
  discountType: "percentage",
  value: "",
  minOrderAmount: "0",
  expiryDate: "",
  isActive: true,
  usageLimit: "",
};

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [modal, setModal] = useState(null); // null | 'create' | coupon
  const [form, setForm] = useState(emptyForm);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json().catch(() => null);
      if (data?.success) setCoupons(data.coupons || []);
      else if (data?.message) setMessage({ type: "error", text: data.message });
    } catch {
      setMessage({ type: "error", text: "Failed to load coupons" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(emptyForm);
    setMessage(null);
    setModal("create");
  };

  const openEdit = (c) => {
    setForm({
      code: c.code || "",
      discountType: c.discountType || "percentage",
      value: c.value ?? "",
      minOrderAmount: c.minOrderAmount ?? "0",
      expiryDate: c.expiryDate
        ? new Date(c.expiryDate).toISOString().slice(0, 10)
        : "",
      isActive: c.isActive !== false,
      usageLimit: c.usageLimit ?? "",
    });
    setMessage(null);
    setModal(c);
  };

  const closeModal = () => {
    setModal(null);
    setForm(emptyForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      value: Number(form.value),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      expiryDate: form.expiryDate || null,
      isActive: Boolean(form.isActive),
      usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
    };

    const isEdit = modal && modal !== "create" && modal._id;

    try {
      const url = isEdit
        ? `/api/coupons?id=${encodeURIComponent(modal._id)}`
        : "/api/coupons";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setMessage({
          type: "success",
          text: isEdit ? "Coupon updated" : "Coupon created",
        });
        closeModal();
        await load();
      } else {
        setMessage({
          type: "error",
          text: data?.message || "Save failed",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting?._id) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/coupons?id=${encodeURIComponent(deleting._id)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setMessage({ type: "success", text: `Deleted ${deleting.code}` });
        setCoupons((prev) => prev.filter((c) => c._id !== deleting._id));
      } else {
        setMessage({ type: "error", text: data?.message || "Delete failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setDeleting(null);
      setSaving(false);
    }
  };

  const setField = (key) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [key]: val }));
  };

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
          Coupons ({coupons.length})
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-700"
        >
          <Plus size={16} />
          Add Coupon
        </button>
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
        {coupons.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-slate-500">
            <Ticket size={32} className="mb-2 text-slate-300" />
            <p className="text-sm">No coupons yet. Create one to offer discounts.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50 text-slate-500">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Min Order</th>
                <th className="px-4 py-3 font-medium">Usage</th>
                <th className="px-4 py-3 font-medium">Expiry</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const expired = isExpired(c.expiryDate);
                const limitReached =
                  c.usageLimit != null && c.usedCount >= c.usageLimit;
                return (
                  <tr key={c._id} className="border-b border-gray-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">
                      {c.code}
                    </td>
                    <td className="px-4 py-3 text-pink-600 font-semibold">
                      {c.discountType === "percentage"
                        ? `${c.value}%`
                        : formatBDT(c.value)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {c.minOrderAmount > 0 ? formatBDT(c.minOrderAmount) : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {c.usedCount || 0}
                      {c.usageLimit != null ? ` / ${c.usageLimit}` : ""}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {c.expiryDate
                        ? new Date(c.expiryDate).toLocaleDateString("en-GB")
                        : "No expiry"}
                    </td>
                    <td className="px-4 py-3">
                      {!c.isActive ? (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          Inactive
                        </span>
                      ) : expired ? (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                          Expired
                        </span>
                      ) : limitReached ? (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Limit reached
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-pink-50 hover:text-pink-600"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(c)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">
                {modal === "create" ? "Add Coupon" : "Edit Coupon"}
              </h3>
              <button type="button" onClick={closeModal} className="rounded-lg p-1.5 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Code *</label>
                <input
                  required
                  value={form.code}
                  onChange={setField("code")}
                  placeholder="GLOW20"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm uppercase focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Type *</label>
                  <select
                    value={form.discountType}
                    onChange={setField("discountType")}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Value *</label>
                  <input
                    required
                    type="number"
                    min={1}
                    max={form.discountType === "percentage" ? 100 : undefined}
                    value={form.value}
                    onChange={setField("value")}
                    placeholder={form.discountType === "percentage" ? "20" : "500"}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Min Order (৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.minOrderAmount}
                    onChange={setField("minOrderAmount")}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={form.usageLimit}
                    onChange={setField("usageLimit")}
                    placeholder="Unlimited"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Expiry Date</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={setField("expiryDate")}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={setField("isActive")}
                  className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-pink-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : modal === "create" ? "Create" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800">Delete coupon?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Delete <span className="font-mono font-bold">{deleting.code}</span>? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
