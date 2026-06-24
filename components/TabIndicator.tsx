"use client";

import { useAppContext } from "@/context/useAppContext";

export default function TabIndicator() {
  const { tabId, activeTabs, isLeader } = useAppContext();

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-full py-[3px] px-2.5 sm:py-1.5 sm:px-3.5 shadow-sm shrink-0">
      <div className="flex items-center gap-1 sm:gap-1.5">
        <span className="text-[0.62rem] sm:text-[0.75rem] font-bold text-[var(--color-text-primary)] tracking-[0.02em] whitespace-nowrap">
          {tabId}
        </span>
        {isLeader && (
          <span className="text-[0.47rem] sm:text-[0.55rem] font-extrabold uppercase tracking-[0.06em] text-[var(--color-principal)] bg-[var(--color-principal-light)] px-1 sm:px-1.5 py-0.5 rounded-sm whitespace-nowrap">
            Leader
          </span>
        )}
      </div>

      <div className="w-px h-2.5 sm:h-3 bg-[var(--color-border)] shrink-0"></div>

      <div className="flex items-center gap-1 sm:gap-1.5 text-[0.62rem] sm:text-[0.7rem] font-medium text-[var(--color-text-secondary)]">
        <div className="relative flex h-2 w-2 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-interest)] opacity-75"></span>
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-interest)]"></span>
        </div>
        <span className="whitespace-nowrap">
          {activeTabs} {activeTabs === 1 ? "Tab" : "Tabs"}
        </span>
      </div>
    </div>
  );
}
