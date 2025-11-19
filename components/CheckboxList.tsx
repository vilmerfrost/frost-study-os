"use client";

import { useState, useEffect } from "react";

interface CheckboxListProps {
  items: string[];
  storageKey: string;
  label?: string;
}

export default function CheckboxList({
  items,
  storageKey,
  label,
}: CheckboxListProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setChecked(new Set(parsed));
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  const toggle = (index: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="mt-1">
      {label && (
        <p className="text-xs font-semibold text-slate-300 mb-1">{label}</p>
      )}
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={checked.has(i)}
              onChange={() => toggle(i)}
              className="mt-0.5 h-3 w-3 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500"
            />
            <span
              className={checked.has(i) ? "line-through text-slate-500" : ""}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

