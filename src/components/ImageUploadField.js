"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Image upload field used in the admin product forms (add + edit).
 *
 * - File input (<input type="file" accept="image/*">) with a live local
 *   preview shown BEFORE uploading.
 * - "ছবি আপলোড করো" button sends the file as multipart/form-data to
 *   /api/upload (Cloudinary) and auto-fills the returned secure_url.
 * - The image URL text input is kept so admins can also paste an external
 *   URL directly; uploading overwrites it automatically.
 * - Shows a spinner during upload and clear success/error messages in
 *   Bengali. Gracefully handles Cloudinary not being configured (503).
 */
export default function ImageUploadField({ value, onChange, error }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // object URL for local preview
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text }
  const inputRef = useRef(null);

  // Create/destroy the local object URL whenever a file is picked
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (e) => {
    const picked = e.target.files?.[0] || null;
    setStatus(null);
    if (picked && !picked.type.startsWith("image/")) {
      setStatus({ type: "error", text: "শুধুমাত্র ছবি ফাইল নির্বাচন করুন (JPG/PNG/WebP)" });
      e.target.value = "";
      return;
    }
    setFile(picked);
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && data.url) {
        onChange(data.url); // auto-fill the image URL field
        setStatus({ type: "success", text: "✅ ছবি আপলোড হয়েছে" });
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
      } else if (res.status === 503) {
        setStatus({
          type: "error",
          text:
            data?.message ||
            "Cloudinary কনফিগার করা হয়নি — Environment Variables সেট করুন। নিচে সরাসরি Image URL বসাতে পারেন।",
        });
      } else {
        setStatus({ type: "error", text: data?.message || "আপলোড ব্যর্থ হয়েছে (Upload failed) — আবার চেষ্টা করুন" });
      }
    } catch {
      setStatus({ type: "error", text: "আপলোড ব্যর্থ হয়েছে (Upload failed) — ইন্টারনেট সংযোগ পরীক্ষা করুন" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="sm:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        প্রোডাক্টের ছবি
      </label>

      {/* Image URL input (also filled automatically after upload) */}
      <input
        type="url"
        dir="ltr"
        value={value || ""}
        onChange={(e) => {
          onChange(e.target.value);
          setStatus(null);
        }}
        placeholder="অথবা ছবির URL হুবহু বসান (https://...)"
        className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#db2777]"
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}

      {/* File picker + upload button */}
      <div className="mt-2 flex flex-col sm:flex-row gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full sm:flex-1 text-sm text-gray-600 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-pink-100 file:text-[#db2777] file:font-semibold hover:file:bg-pink-200 file:cursor-pointer cursor-pointer border border-pink-200 rounded-lg"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-[#db2777] text-white hover:bg-[#9d174d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {uploading && (
            <span
              className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
              aria-hidden="true"
            />
          )}
          {uploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড করো"}
        </button>
      </div>

      {/* Preview of the selected image (before upload) or current image */}
      {(previewUrl || value) && (
        <div className="mt-3 relative h-36 w-36 overflow-hidden rounded-xl border border-pink-200 bg-pink-50">
          <Image
            src={previewUrl || value}
            alt="ছবির প্রিভিউ"
            fill
            unoptimized
            sizes="144px"
            className="object-cover"
          />
          {previewUrl && (
            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-0.5">
              প্রিভিউ (আপলোডের আগে)
            </span>
          )}
        </div>
      )}

      {/* Upload status message */}
      {status && (
        <p
          className={`mt-2 text-xs font-medium ${
            status.type === "success" ? "text-green-700" : "text-red-600"
          }`}
        >
          {status.text}
        </p>
      )}
    </div>
  );
}
