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

  if (schedule.length === 0) {
    return (
      <div className="py-12 px-6 text-center text-[var(--color-text-muted)] text-[0.875rem]">
        No schedule to display.
      </div>
    );
  }

  const colHeaderClass =
    "py-2 px-2 sm:py-3 sm:px-4 text-right text-[0.6rem] sm:text-[0.72rem] md:text-[0.78rem] font-bold text-[var(--color-text-muted)] whitespace-nowrap tracking-[0.05em] uppercase border-b border-[var(--color-border)] bg-[var(--color-bg-input)]";

  return (
    <div className="flex flex-col gap-0">
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full border-collapse text-[0.82rem]">
          <thead>
            <tr>
              <th className="py-2 px-2 sm:py-3 sm:px-4 text-center text-[0.6rem] sm:text-[0.72rem] md:text-[0.78rem] font-bold text-[var(--color-text-muted)] whitespace-nowrap tracking-[0.05em] uppercase border-b border-[var(--color-border)] bg-[var(--color-bg-input)] rounded-tl-2xl">
                Month
              </th>
              <th className={`${colHeaderClass} hidden sm:table-cell`}>EMI</th>
              <th className={colHeaderClass}>Principal</th>
              <th className={colHeaderClass}>Interest</th>
              {showPrepayment && <th className={`${colHeaderClass} hidden md:table-cell`}>Prepayment</th>}
              <th className={`${colHeaderClass} pr-4 sm:pr-5 rounded-tr-2xl`}>Balance</th>
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((row, idx) => {
              const isBreakEven = row.month === breakEvenMonth;
              const isFirstOfYear = row.month > 1 && (row.month - 1) % 12 === 0;
              const yearNumber = Math.ceil(row.month / 12);

              return [
                isFirstOfYear && (
                  <tr key={`yr-${yearNumber}`}>
                    <td
                      colSpan={showPrepayment ? 6 : 5}
                      className="px-4 sm:px-5 pt-3 pb-1"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[0.66rem] font-extrabold text-[var(--color-text-muted)] uppercase tracking-[0.1em] whitespace-nowrap">
                          Year {yearNumber}
                        </span>
                        <div className="flex-1 h-px bg-[var(--color-border)]" />
                      </div>
                    </td>
                  </tr>
                ),

                <tr
                  key={row.month}
                  className={`border-b border-[var(--color-border)] transition-colors duration-100 ${
                    isBreakEven
                      ? "bg-[var(--color-principal-light)]"
                      : idx % 2 !== 0
                      ? "bg-[rgba(255,255,255,0.012)]"
                      : "bg-transparent"
                  } hover:bg-[var(--color-bg-input-hover)]`}
                >
                  <td className="py-2 px-2 sm:py-2.5 sm:px-4 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center gap-[2px]">
                      <span className={`text-[0.72rem] sm:text-[0.85rem] md:text-[0.9rem] font-bold tabular-nums leading-none ${
                        isBreakEven ? "text-[var(--color-principal)]" : "text-[var(--color-text-primary)]"
                      }`}>
                        {row.month}
                      </span>
                      {isBreakEven && (
                        <span className="text-[0.58rem] font-bold text-[var(--color-principal)] leading-none">
                          Break even
                        </span>
                      )}
                    </div>
                  </td>

                  {/* EMI */}
                  <td className="hidden sm:table-cell py-2 px-2 sm:py-2.5 sm:px-4 text-right text-[var(--color-text-muted)] font-medium tabular-nums whitespace-nowrap text-[0.72rem] sm:text-[0.85rem] md:text-[0.9rem]">
                    {formatINR(row.emi)}
                  </td>

                  {/* Principal */}
                  <td className="py-2 px-2 sm:py-2.5 sm:px-4 text-right font-semibold text-[var(--color-principal)] tabular-nums whitespace-nowrap text-[0.72rem] sm:text-[0.85rem] md:text-[0.9rem]">
                    {formatINR(row.principal)}
                  </td>

                  {/* Interest */}
                  <td className="py-2 px-2 sm:py-2.5 sm:px-4 text-right font-medium text-[var(--color-interest)] tabular-nums whitespace-nowrap text-[0.72rem] sm:text-[0.85rem] md:text-[0.9rem]">
                    {formatINR(row.interest)}
                  </td>

                  {/* Prepayment */}
                  {showPrepayment && (
                    <td className="hidden md:table-cell py-2.5 px-3 text-right font-semibold tabular-nums whitespace-nowrap">
                      {row.prepayment > 0 ? (
                        <span className="text-[var(--color-interest)]">{formatINR(row.prepayment)}</span>
                      ) : (
                        <span className="text-[var(--color-border-bright)]">—</span>
                      )}
                    </td>
                  )}

                  {/* Balance */}
                  <td className={`py-2 px-2 sm:py-2.5 sm:pl-4 pr-2 sm:pr-5 text-right font-medium tabular-nums whitespace-nowrap text-[0.72rem] sm:text-[0.85rem] md:text-[0.9rem] ${
                    row.balance === 0
                      ? "text-[var(--color-principal)]"
                      : "text-[var(--color-text-secondary)]"
                  }`}>
                    {row.balance === 0 ? "Paid off" : formatINR(row.balance)}
                  </td>
                </tr>,
              ];
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
