"use client";

import { useState } from "react";
import type { AmortizationRow } from "@/types/state";
import AmortizationTable from "./AmortizationTable";
import AmortizationChart from "./AmortizationChart";

interface AmortizationSectionProps {
  schedule: AmortizationRow[];
  breakEvenMonth: number;
  showPrepayment?: boolean;
  title?: string;
  subtitle?: string;
}

function TableIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="3" y1="15" x2="21" y2="15"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

export default function AmortizationSection({
  schedule,
  breakEvenMonth,
  showPrepayment = false,
  title = "Amortization Schedule",
  subtitle = "Month-by-month principal & interest breakdown",
}: AmortizationSectionProps) {
  const [view, setView] = useState<"table" | "chart">("table");

  return (
    <div className="glass-card p-7 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-[30px] h-[30px] rounded-lg bg-[var(--color-interest-light)] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-interest)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">
              {title}
            </h2>
          </div>
          <p className="text-[0.72rem] text-[var(--color-text-muted)] ml-10">
            {subtitle}
          </p>
          {breakEvenMonth > 0 && (
            <div className="inline-flex items-center gap-1.5 mt-2 ml-10 px-2.5 py-1 bg-[var(--color-interest-light)] rounded-full border border-[var(--color-interest-light)]">
              <span className="text-[0.7rem] text-[var(--color-interest)] font-bold">
                Break-even at month {breakEvenMonth}
              </span>
            </div>
          )}
        </div>

        <div className="w-full md:w-auto flex justify-center md:justify-end">
          <div className="flex gap-1 p-1 bg-[var(--color-bg-input)] rounded-[10px] border border-[var(--color-border)] shrink-0">
            {(["table", "chart"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-[7px] text-[0.78rem] font-semibold border-none cursor-pointer font-[inherit] transition-all duration-200 ${
                  view === v
                    ? "bg-[var(--color-bg-card)] text-[var(--color-principal)] shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                    : "bg-transparent text-[var(--color-text-muted)] shadow-none"
                }`}
              >
                {v === "table" ? <TableIcon /> : <ChartIcon />}
                {v === "table" ? "Table" : "Chart"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "table" ? (
        <AmortizationTable
          schedule={schedule}
          breakEvenMonth={breakEvenMonth}
          showPrepayment={showPrepayment}
        />
      ) : (
        <AmortizationChart schedule={schedule} breakEvenMonth={breakEvenMonth} />
      )}

      {view === "chart" && (
        <div className="flex gap-5 justify-center flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-[3px] bg-[var(--color-principal)]" />
            <span className="text-[0.75rem] text-[var(--color-text-secondary)] font-medium">Principal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-[3px] bg-[var(--color-interest)]" />
            <span className="text-[0.75rem] text-[var(--color-text-secondary)] font-medium">Interest</span>
          </div>
          {breakEvenMonth > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-[2px] border-t-2 border-dashed border-[var(--color-interest)]" />
              <span className="text-[0.75rem] text-[var(--color-text-secondary)] font-medium">Break-even</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}