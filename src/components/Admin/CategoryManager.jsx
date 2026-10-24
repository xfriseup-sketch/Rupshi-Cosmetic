"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2 whitespace-nowrap">
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
      <span className="text-xs text-gray-700">{label}</span>
    </label>
  );
}

const DEPARTMENTS = [
  { value: "beauty", label: "Beauty" },
  { value: "fashion", label: "Fashion" },
  { value: "tech", label: "Tech" },
];

const emptyForm = {
  department: "beauty",
  name: "",
  slug: "",
  parentCategory: "",
  isHomeVisible: false,
  icon: "",
};

function buildDisplayOrder(categories) {
  const byId = new Map(categories.map((c) => [c._id, c]));
  const childrenOf = (id) =>
    categories.filter((c) => String(c.parentCategory || "") === String(id));
  const roots = categories.filter(
    (c) => !c.parentCategory || !byId.has(String(c.parentCategory))
  );
  const out = [];
  const visit = (cat, depth) => {
    out.push({ cat, depth });
    childrenOf(cat._id).forEach((child) => visit(child, Math.min(depth + 1, 3)));
  };
  roots.forEach((r) => visit(r, 0));
  categories
    .filter((c) => !out.some((o) => o.cat._id === c._id))
    .forEach((c) => visit(c, 0));
  return out;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [deleting, setDeleting] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json().catch(() => null);
      if (data?.success) setCategories(data.categories || []);
      else if (data?.message) setMessage({ type: "error", text: data.message });
    } catch {
      setMessage({ type: "error", text: "Failed to load categories" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, icon: "" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setForm(emptyForm);
        setMessage({ type: "success", text: data.message || "Category created" });
        fetchCategories();
      } else {
        setMessage({ type: "error", text: data.message || "Could not create category" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditForm({
      department: cat.department || "beauty",
      name: cat.name,
      slug: cat.slug || "",
      parentCategory: cat.parentCategory ? String(cat.parentCategory) : "",
      isHomeVisible: Boolean(cat.isHomeVisible),
      icon: "",
    });
    setMessage(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, icon: "" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditingId(null);
        setMessage({ type: "success", text: data.message || "Category updated" });
        fetchCategories();
      } else {
        setMessage({ type: "error", text: data.message || "Update failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/categories/${deleting._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: `Deleted "${deleting.name}"` });
        setCategories((prev) => prev.filter((c) => c._id !== deleting._id));
      } else {
        setMessage({
          type: "error",
          text: data.message || "Could not delete (may have products or sub-categories)",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setDeleting(null);
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30";

  const mainCategories = categories.filter((c) => !c.parentCategory);
  const parentsFor = (department, excludeId) =>
    mainCategories.filter(
      (c) => (c.department || "beauty") === department && c._id !== excludeId
    );
  const displayRows = buildDisplayOrder(categories);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">
        Categories ({categories.length})
      </h2>

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

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-12"
      >
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">Department *</label>
          <select
            value={form.department}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, department: e.target.value, parentCategory: "" }))
            }
            className={`${inputClass} bg-white`}
          >
            {DEPARTMENTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3">
          <label className="mb-1 block text-xs font-medium text-gray-600">Name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Skincare"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-3">
          <label className="mb-1 block text-xs font-medium text-gray-600">Parent</label>
          <select
            value={form.parentCategory}
            onChange={(e) => {
              const v = e.target.value;
              setForm((p) => ({
                ...p,
                parentCategory: v,
                isHomeVisible: v ? false : p.isHomeVisible,
              }));
            }}
            className={`${inputClass} bg-white`}
          >
            <option value="">None (main category)</option>
            {parentsFor(form.department).map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">Slug</label>
          <input
            dir="ltr"
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            placeholder="auto"
            className={inputClass}
          />
        </div>
        <div className="flex items-end pb-1 sm:col-span-2">
          <Toggle
            checked={form.isHomeVisible && !form.parentCategory}
            onChange={(v) => setForm((p) => ({ ...p, isHomeVisible: v }))}
            label="Show on home"
          />
        </div>
        <div className="flex items-end sm:col-span-1">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-pink-600 px-3 py-2 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        {categories.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">
            No categories yet. Add one above.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50 text-slate-500">
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Parent</th>
                <th className="px-4 py-3 font-medium">Home</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map(({ cat, depth }) =>
                editingId === cat._id ? (
                  <tr key={cat._id} className="border-b border-gray-50 bg-pink-50/40">
                    <td colSpan={6} className="px-4 py-3">
                      <form
                        onSubmit={handleUpdate}
                        className="grid grid-cols-1 items-end gap-2 sm:grid-cols-12"
                      >
                        <div className="sm:col-span-2">
                          <label className="mb-0.5 block text-xs text-gray-500">Department *</label>
                          <select
                            value={editForm.department || "beauty"}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                department: e.target.value,
                                parentCategory: "",
                              }))
                            }
                            className={`${inputClass} bg-white`}
                          >
                            {DEPARTMENTS.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="mb-0.5 block text-xs text-gray-500">Name *</label>
                          <input
                            required
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((p) => ({ ...p, name: e.target.value }))
                            }
                            className={inputClass}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="mb-0.5 block text-xs text-gray-500">Parent</label>
                          <select
                            value={editForm.parentCategory}
                            onChange={(e) => {
                              const v = e.target.value;
                              setEditForm((p) => ({
                                ...p,
                                parentCategory: v,
                                isHomeVisible: v ? false : p.isHomeVisible,
                              }));
                            }}
                            className={`${inputClass} bg-white`}
                          >
                            <option value="">None (main)</option>
                            {parentsFor(editForm.department || "beauty", editingId).map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="mb-0.5 block text-xs text-gray-500">Slug</label>
                          <input
                            dir="ltr"
                            value={editForm.slug}
                            onChange={(e) =>
                              setEditForm((p) => ({ ...p, slug: e.target.value }))
                            }
                            className={inputClass}
                          />
                        </div>
                        <div className="flex items-end pb-1 sm:col-span-2">
                          <Toggle
                            checked={editForm.isHomeVisible && !editForm.parentCategory}
                            onChange={(v) =>
                              setEditForm((p) => ({ ...p, isHomeVisible: v }))
                            }
                            label="Home"
                          />
                        </div>
                        <div className="flex justify-end gap-2 sm:col-span-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-pink-600 px-4 py-2 text-xs font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={cat._id} className="border-b border-gray-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {cat.department || "beauty"}
                    </td>
                    <td
                      className="px-4 py-3 font-medium text-slate-800"
                      style={{ paddingInlineStart: `${1 + depth * 1.25}rem` }}
                    >
                      {cat.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500" dir="ltr">
                      {cat.slug}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {depth > 0
                        ? mainCategories.find(
                            (m) => m._id === String(cat.parentCategory)
                          )?.name || "—"
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {cat.isHomeVisible && !cat.parentCategory ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Visible
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-pink-50 hover:text-pink-600"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(cat)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800">Delete category?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Delete "{deleting.name}"? Categories with products or sub-categories cannot be deleted.
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
