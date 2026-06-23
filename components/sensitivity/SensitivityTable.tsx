"use client";

import { useMemo } from "react";
import { useAppContext } from "@/context/useAppContext";
import { buildSensitivityGrid } from "@/utils/sensitivity";
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
    <div className="glass-card p-7 flex flex-col gap-[18px]">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-[30px] h-[30px] rounded-lg bg-[var(--color-principal-light)] flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
            </svg>
          </div>
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">
            Sensitivity Analysis
          </h2>
        </div>
        <p className="text-[0.72rem] text-[var(--color-text-muted)] ml-10">
          EMI across rate × tenure — current values highlighted
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-[2px] text-[0.78rem]">
          <thead>
            <tr>
              <th className="py-2 px-3 text-left text-[var(--color-text-muted)] font-semibold text-[0.68rem] whitespace-nowrap tracking-[0.03em]">
                Tenure ↓ / Rate →
              </th>
              {rates.map((r) => (
                <th
                  key={r}
                  className={`py-2 px-2.5 text-right font-bold whitespace-nowrap text-[0.72rem] tracking-[0.02em] ${
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
                  className={`py-[7px] px-3 font-bold whitespace-nowrap text-[0.72rem] ${
                    t === tenure ? "text-[var(--color-principal)]" : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  {formatTenureLabel(t)}
                </td>
                {rates.map((r, ri) => {
                  const cellEMI = grid[ti]?.[ri] ?? 0;
                  const isCenter = r === rate && t === tenure;

                  return (
                    <td
                      key={r}
                      className={`py-[7px] px-2.5 text-right whitespace-nowrap rounded-[7px] text-[0.78rem] transition-colors duration-150 cursor-default ${
                        isCenter
                          ? "font-extrabold bg-[var(--color-principal)] text-white shadow-[0_4px_16px_var(--color-principal-glow)]"
                          : r === rate || t === tenure
                          ? "font-medium bg-[var(--color-bg-input)] text-[var(--color-text-primary)] shadow-none"
                          : "font-medium bg-transparent text-[var(--color-text-secondary)] shadow-none"
                      }`}
                    >
                      {formatINR(cellEMI)}
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