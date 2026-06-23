"use client";

import { useState, useEffect } from "react";
import { generateTabId } from "@/utils/tabId";

export function useTabId(): string {
  const [tabId, setTabId] = useState("");

  useEffect(() => {
    setTabId(generateTabId());
  }, []);

  return tabId;
}