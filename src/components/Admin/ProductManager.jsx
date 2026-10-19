"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Package,
  Star,
  Flame,
} from "lucide-react";
import ImageUploadField from "@/components/ImageUploadField";

function formatBDT(n) {
  return `৳${Number(n || 0).toLocaleString("en-BD")}`;
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-pink-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "",
  brand: "",
  image: "",
  inStock: true,
  isFeatured: false,
  isNew: false,
  isHotOffer: false,
};

function normalizePayload(form) {
  return {
    name: form.name.trim(),
    description: (form.description || "").trim(),
    price: Number(form.price),
    discountPrice:
      form.discountPrice === "" || form.discountPrice == null
        ? null
        : Number(form.discountPrice),
    category: form.category,
    brand: form.brand.trim(),
    image: form.image.trim(),
    inStock: Boolean(form.inStock),
    isFeatured: Boolean(form.isFeatured),
    isNew: Boolean(form.isNew),
    isHotOffer: Boolean(form.isHotOffer),
  };
}

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [modal, setModal] = useState(null); // null | 'create' | product object
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
      ]);
      const pData = await pRes.json().catch(() => null);
      const cData = await cRes.json().catch(() => null);
      if (pData?.success) setProducts(pData.products || []);
      if (cData?.success) setCategories(cData.categories || []);
    } catch {
      setMessage({ type: "error", text: "Failed to load products" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(emptyForm);
    setFieldErrors({});
    setMessage(null);
    setModal("create");
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      discountPrice: product.discountPrice ?? "",
      category: product.category || "",
      brand: product.brand || "",
      image: product.image || "",
      inStock: product.inStock !== false,
      isFeatured: Boolean(product.isFeatured),
      isNew: Boolean(product.isNew),
      isHotOffer: Boolean(product.isHotOffer),
    });
    setFieldErrors({});
    setMessage(null);
    setModal(product); // product object with _id
  };

  const closeModal = () => {
    setModal(null);
    setForm(emptyForm);
    setFieldErrors({});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setMessage(null);

    const payload = normalizePayload(form);
    const isEdit = modal && modal !== "create" && modal._id;

    try {
      const url = isEdit
        ? `/api/products?id=${encodeURIComponent(modal._id)}`
        : "/api/products";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setFieldErrors(data?.errors || {});
        setMessage({
          type: "error",
          text: data?.message || `Save failed (HTTP ${res.status})`,
        });
      } else {
        setMessage({
          type: "success",
          text: isEdit ? "Product updated" : "Product created",
        });
        closeModal();
        await load();
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
        `/api/products?id=${encodeURIComponent(deleting._id)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setMessage({ type: "success", text: `Deleted "${deleting.name}"` });
        setProducts((prev) => prev.filter((p) => p._id !== deleting._id));
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
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const mainCats = categories.filter((c) => !c.parentCategory);
  const subCats = categories.filter((c) => c.parentCategory);

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
          Products ({products.length})
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-700"
        >
          <Plus size={16} />
          Add New Product
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
        {products.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">
            No products yet. Click "Add New Product" to create one.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50 text-slate-500">
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Badges</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-rose-50">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package size={18} className="text-rose-300" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.brand || p.category}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-pink-600">
                      {formatBDT(p.discountPrice ?? p.price)}
                    </span>
                    {p.discountPrice != null && p.discountPrice < p.price && (
                      <span className="ml-1 text-xs text-slate-400 line-through">
                        {formatBDT(p.price)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.inStock
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {p.inStock ? "In stock" : "Out of stock"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.isFeatured && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          <Star size={10} /> Featured
                        </span>
                      )}
                      {p.isHotOffer && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                          <Flame size={10} /> Hot
                        </span>
                      )}
                      {p.isNew && (
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                          New
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-pink-50 hover:text-pink-600"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(p)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">
                {modal === "create" ? "Add New Product" : "Edit Product"}
              </h3>
              <button type="button" onClick={closeModal} className="rounded-lg p-1.5 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={setField("name")}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={setField("description")}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Price (BDT) *</label>
                  <input
                    required
                    type="number"
                    min={0}
                    step="1"
                    value={form.price}
                    onChange={setField("price")}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
                  />
                  {fieldErrors.price && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Discount Price</label>
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={form.discountPrice}
                    onChange={setField("discountPrice")}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
                  />
                  {fieldErrors.discountPrice && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.discountPrice}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Brand *</label>
                  <input
                    required
                    value={form.brand}
                    onChange={setField("brand")}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
                  />
                  {fieldErrors.brand && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.brand}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
                  <select
                    required
                    value={form.category}
                    onChange={setField("category")}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
                  >
                    <option value="">Select category</option>
                    {mainCats.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    {subCats.map((c) => (
                      <option key={c._id} value={c.name}>
                        — {c.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.category && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.category}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <ImageUploadField
                    value={form.image}
                    onChange={(url) => setForm((p) => ({ ...p, image: url }))}
                    error={fieldErrors.image}
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-5 border-t border-gray-100 pt-4">
                  <Toggle checked={form.inStock} onChange={(v) => setForm((p) => ({ ...p, inStock: v }))} label="In Stock" />
                  <Toggle checked={form.isFeatured} onChange={(v) => setForm((p) => ({ ...p, isFeatured: v }))} label="Featured" />
                  <Toggle checked={form.isHotOffer} onChange={(v) => setForm((p) => ({ ...p, isHotOffer: v }))} label="Hot Offer" />
                  <Toggle checked={form.isNew} onChange={(v) => setForm((p) => ({ ...p, isNew: v }))} label="New Arrival" />
                </div>
              </div>

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
                  {saving ? "Saving..." : modal === "create" ? "Create Product" : "Update Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800">Delete product?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This will permanently delete "{deleting.name}". This cannot be undone.
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
