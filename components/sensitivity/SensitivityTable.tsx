"use client";

import { useMemo } from "react";
import { useAppContext } from "@/context/useAppContext";
import { buildSensitivityGrid } from "@/utils/sensitivity";
import Tooltip from "@/components/ui/Tooltip";
import { formatINR } from "@/utils/format";

function formatTenureLabel(months: number): string {
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} yr`;
  return `${years} yr ${rem} mo`;
}

export default function SensitivityTable() {
  const { state } = useAppContext();
  const { amount, rate, tenure } = state.loan;

  const { rates, tenures, grid } = useMemo(
    () => buildSensitivityGrid(amount, rate, tenure),
    [amount, rate, tenure]
  );

  return (
    <div className="glass-card p-3 sm:p-7 flex flex-col gap-3 sm:gap-4">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-1 h-4 rounded-full bg-[var(--color-principal)]"></div>
          <Tooltip
            content="EMI across rate × tenure — current values highlighted"
            className="w-max"
          >
            <h2 className="text-[0.8rem] font-extrabold uppercase tracking-[0.08em] text-[var(--color-text-primary)] border-b border-dashed border-[var(--color-text-muted)] pb-[1px]">
              Sensitivity Analysis
            </h2>
          </Tooltip>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-[2px] text-[0.65rem] sm:text-[0.78rem]">
          <thead>
            <tr>
              <th className="py-1.5 sm:py-2 px-2 sm:px-3 text-left text-[var(--color-text-muted)] font-semibold text-[0.6rem] sm:text-[0.68rem] whitespace-nowrap tracking-[0.03em]">
                Tenure ↓ / Rate →
              </th>
              {rates.map((r) => (
                <th
                  key={r}
                  className={`py-1.5 sm:py-2 px-1.5 sm:px-2.5 text-right font-bold whitespace-nowrap text-[0.62rem] sm:text-[0.72rem] tracking-[0.02em] ${
                    r === rate ? "text-[var(--color-principal)]" : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {r}%
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {tenures.map((t, ti) => (
              <tr key={t}>
                <td
                  className={`py-[5px] sm:py-[7px] px-2 sm:px-3 font-bold whitespace-nowrap text-[0.62rem] sm:text-[0.72rem] ${
                    t === tenure ? "text-[var(--color-principal)]" : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  {formatTenureLabel(t)}
                </td>
                {rates.map((r, ri) => {
                  const cellEMI = grid[ti]?.[ri] ?? 0;
                  const isCenter = r === rate && t === tenure;
                  const isCurrentRow = t === tenure;
                  const isCurrentCol = r === rate;

                  return (
                    <td
                      key={r}
                      className={`py-[5px] sm:py-[7px] px-1.5 sm:px-2.5 text-right whitespace-nowrap rounded-[5px] sm:rounded-[7px] text-[0.65rem] sm:text-[0.78rem] transition-colors duration-150 cursor-default ${
                        isCenter
                          ? "font-extrabold bg-[var(--color-principal)] text-white shadow-[0_4px_16px_var(--color-principal-glow)]"
                          : isCurrentRow || isCurrentCol
                          ? "font-medium bg-[var(--color-bg-input)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input-hover)]"
                          : "font-medium bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-input)] hover:text-[var(--color-text-primary)]"
                      }`}
                    >
                      <span className="tabular-nums">{formatINR(cellEMI)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
