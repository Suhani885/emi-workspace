"use client";

import { useAppContext } from "@/context/useAppContext";

export default function TabIndicator() {
  const { tabId, activeTabs, isLeader } = useAppContext();

  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-full py-1 sm:py-1.5 px-2 sm:px-3.5 shadow-sm shrink-0">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-block text-[0.65rem] sm:text-[0.75rem] font-bold text-[var(--color-text-primary)] tracking-[0.02em]">
            {tabId}
          </span>
          {isLeader && (
            <span className="text-[0.5rem] sm:text-[0.55rem] font-extrabold uppercase tracking-[0.06em] text-[var(--color-principal)] bg-[var(--color-principal-light)] px-1 sm:px-1.5 py-0.5 rounded-sm">
              <span>Leader</span>
            </span>
          )}
        </div>
      </div>
      
      <div className="hidden sm:block w-px h-3 bg-[var(--color-border)]"></div>
      
      <div className="flex items-center gap-1.5 text-[0.65rem] sm:text-[0.7rem] font-medium text-[var(--color-text-secondary)]">
        <div className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-interest)] opacity-75"></span>
          <span className="relative inline-flex h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-[var(--color-interest)]"></span>
        </div>
        <span>
          {activeTabs} <span className="hidden sm:inline">{activeTabs === 1 ? "Tab" : "Tabs"}</span>
        </span>
      </div>
    </div>
  );
}
