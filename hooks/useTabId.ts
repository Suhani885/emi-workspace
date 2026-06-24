"use client";

import { useState, useEffect } from "react";
import { generateTabId } from "@/utils/tabId";

export function useTabId(): { tabId: string; joinedAt: number } {
  const [tabId, setTabId] = useState("");
  const [joinedAt, setJoinedAt] = useState(0);

  useEffect(() => {
    const result = generateTabId();
    setTabId(result.tabId);
    setJoinedAt(result.joinedAt);
  }, []);

  return { tabId, joinedAt };
}
