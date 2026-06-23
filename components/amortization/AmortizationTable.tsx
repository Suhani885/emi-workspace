"use client";

import { useState, useMemo } from "react";
import type { AmortizationRow } from "@/types/state";
import { formatINR } from "@/utils/format";
import Pagination from "./Pagination";

interface AmortizationTableProps {
  schedule: AmortizationRow[];
  breakEvenMonth: number;
  showPrepayment?: boolean;
}

const ROWS_PER_PAGE = 12;

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

export default function AmortizationTable({
  schedule,
  breakEvenMonth,
  showPrepayment = false,
}: AmortizationTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(schedule.length / ROWS_PER_PAGE));

  const visibleRows = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return schedule.slice(start, start + ROWS_PER_PAGE);
  }, [schedule, page]);

  const handleExport = () => {
    const headers = ["Month", "EMI", "Principal", "Interest", showPrepayment ? "Prepayment" : "", "Balance"]
      .filter(Boolean)
      .join(",");
    const rows = schedule.map((row) => {
      const cols = [
        row.month,
        row.emi.toFixed(2),
        row.principal.toFixed(2),
        row.interest.toFixed(2),
        showPrepayment ? row.prepayment.toFixed(2) : "",
        row.balance.toFixed(2),
      ].filter((_, i) => !(!showPrepayment && i === 4));
      return cols.join(",");
    });
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "amortization-schedule.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (schedule.length === 0) {
    return (
      <div className="py-12 px-6 text-center text-[var(--color-text-muted)] text-[0.875rem]">
        No schedule to display.
      </div>
    );
  }

  const colClass = "py-2.5 px-3.5 text-right text-[0.8rem] font-medium text-[var(--color-text-muted)] whitespace-nowrap tracking-[0.04em] uppercase border-b border-[var(--color-border)]";

  return (
    <div className="flex flex-col gap-0">
      <div className="flex justify-end mb-3">
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] text-[0.75rem] font-semibold cursor-pointer font-[inherit] transition-all duration-200 hover:border-[var(--color-principal)] hover:text-[var(--color-principal)]"
        >
          <DownloadIcon />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full border-collapse text-[0.85rem]">
          <thead>
            <tr className="bg-[var(--color-bg-input)]">
              <th className={`${colClass} text-left pl-5 w-[90px] rounded-tl-2xl`}>
                Month
              </th>
              <th className={colClass}>EMI</th>
              <th className={colClass}>Principal</th>
              <th className={colClass}>Interest</th>
              {showPrepayment && <th className={colClass}>Prepayment</th>}
              <th className={`${colClass} pr-5 rounded-tr-2xl`}>Balance</th>
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((row, idx) => {
              const isBreakEven = row.month === breakEvenMonth;
              const isEven = idx % 2 === 0;

              return (
                <tr
                  key={row.month}
                  className={`table-row-hover transition-colors duration-150 border-b border-[var(--color-border)] ${
                    isBreakEven
                      ? "bg-[var(--color-principal-light)]"
                      : isEven
                      ? "bg-transparent"
                      : "bg-[rgba(255,255,255,0.015)]"
                  }`}
                >
                  <td
                    className={`py-[11px] pr-[14px] pl-5 font-semibold ${
                      isBreakEven ? "text-[var(--color-principal)]" : "text-[var(--color-text-primary)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{row.month}</span>
                      {isBreakEven && (
                        <span className="be-badge">BE</span>
                      )}
                    </div>
                  </td>
                  <td className="py-[11px] px-[14px] text-right text-[var(--color-text-secondary)] font-medium">
                    {formatINR(row.emi)}
                  </td>
                  <td className="py-[11px] px-[14px] text-right font-semibold text-[var(--color-principal)]">
                    {formatINR(row.principal)}
                  </td>
                  <td className="py-[11px] px-[14px] text-right font-medium text-[var(--color-interest)]">
                    {formatINR(row.interest)}
                  </td>
                  {showPrepayment && (
                    <td
                      className={`py-[11px] px-[14px] text-right font-semibold ${
                        row.prepayment > 0 ? "text-[var(--color-interest)]" : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {row.prepayment > 0 ? formatINR(row.prepayment) : "—"}
                    </td>
                  )}
                  <td className="py-[11px] pl-[14px] pr-5 text-right text-[var(--color-text-secondary)] font-medium">
                    {formatINR(row.balance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalRows={schedule.length}
        rowsPerPage={ROWS_PER_PAGE}
        onPageChange={setPage}
      />
    </div>
  );
}