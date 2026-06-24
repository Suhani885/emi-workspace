"use client";

import { useState, useCallback } from "react";
import { buildShareUrl } from "@/utils/urlState";
import type { Loan } from "@/types/state";

type CopyStatus = "idle" | "copied" | "error";

export function useCopyLink(loan: Loan) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  const copy = useCallback(async () => {
    const url = buildShareUrl(loan);
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2200);
    } catch {
      try {
        const el = document.createElement("textarea");
        el.value = url;
        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setStatus("copied");
        setTimeout(() => setStatus("idle"), 2200);
      } catch {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 2200);
      }
    }
  }, [loan]);

  return { copy, status };
}
