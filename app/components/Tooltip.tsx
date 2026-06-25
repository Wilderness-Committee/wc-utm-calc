"use client";

import { useState } from "react";

export default function Tooltip({ text }: { text?: string }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <span className="relative inline-block ml-1 align-middle">
      <button
        type="button"
        aria-label="Help"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-400 text-white text-xs leading-none cursor-help"
      >
        i
      </button>
      {open && (
        <span className="absolute z-10 left-5 top-0 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}
