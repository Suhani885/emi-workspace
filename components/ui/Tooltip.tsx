"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  tipClassName?: string;
}

export default function Tooltip({ content, children, className, tipClassName }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div
      ref={ref}
      className={`relative cursor-pointer ${className ?? ""}`}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setOpen(true); }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") setOpen(false); }}
      onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
    >
      {children}
      {open && (
        <div
          className={`absolute top-full left-0 mt-2 px-2.5 py-1.5 bg-[var(--color-text-primary)] text-[var(--color-bg-base)] text-[0.75rem] font-medium rounded-lg shadow-lg z-[60] w-max max-w-[280px] leading-snug ${tipClassName ?? ""}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
