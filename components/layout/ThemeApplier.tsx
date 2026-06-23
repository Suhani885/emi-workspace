"use client";

import { useEffect } from "react";
import { useAppContext } from "@/context/useAppContext";

export default function ThemeApplier() {
  const { state } = useAppContext();

  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
    localStorage.setItem("emi-theme", state.theme);
    document.cookie = `emi-theme=${state.theme};path=/;max-age=31536000;SameSite=Lax`;
  }, [state.theme]);

  return null;
}