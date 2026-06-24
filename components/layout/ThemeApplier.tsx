"use client";

import { useEffect, useRef } from "react";
import { useAppContext } from "@/context/useAppContext";

export default function ThemeApplier() {
  const { state } = useAppContext();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const root = document.documentElement;

    if (!isFirstRender.current) {
      root.classList.add("theme-changing");
    }
    isFirstRender.current = false;

    if (state.theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }

    const t = setTimeout(() => root.classList.remove("theme-changing"), 400);
    localStorage.setItem("emi-theme", state.theme);
    document.cookie = `emi-theme=${state.theme};path=/;max-age=31536000;SameSite=Lax`;

    return () => clearTimeout(t);
  }, [state.theme]);

  return null;
}
