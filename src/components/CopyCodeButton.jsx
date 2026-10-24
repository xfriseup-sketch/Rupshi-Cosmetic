"use client";

import { useState } from "react";

export default function CopyCodeButton({ code }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          setCopied(false);
        }
      }}
      className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
    >
      {copied ? "কপি হয়েছে" : "কপি করুন"}
    </button>
  );
}
