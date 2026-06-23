"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAppContext } from "@/context/useAppContext";
import { useEMI } from "@/hooks/useEMI";
import { formatINR } from "@/utils/format";
import { useState, useEffect } from "react";

const PRINCIPAL_COLOR = "var(--color-principal)";
const INTEREST_COLOR = "var(--color-interest)";

interface DonutLabelProps {
  cx: number;
  cy: number;
  emi: number;
}

function DonutCenterLabel({ cx, cy, emi }: DonutLabelProps) {
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle" fill="var(--color-text-muted)" fontSize="11" fontFamily="Plus Jakarta Sans" fontWeight={600} letterSpacing="0.05em">
        MONTHLY EMI
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" dominantBaseline="middle" fill="var(--color-text-primary)" fontSize="20" fontFamily="Plus Jakarta Sans" fontWeight={800} letterSpacing="-0.02em">
        {formatINR(emi)}
      </text>
    </g>
  );
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { color: string } }[];
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-bright)] rounded-[10px] py-2.5 px-3.5 text-[0.8rem] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-2">
        <div style={{ background: payload[0].payload.color }} className="w-2 h-2 rounded-sm" />
        <span className="text-[var(--color-text-secondary)]">{payload[0].name}</span>
        <span className="font-bold text-[var(--color-text-primary)] ml-1.5">
          {formatINR(payload[0].value)}
        </span>
      </div>
    </div>
  );
};

export default function SummaryCards() {
  const { state } = useAppContext();
  const { amount, rate, tenure } = state.loan;
  const { emi, totalInterest, totalPayable, principalPercent, interestPercent } =
    useEMI(amount, rate, tenure);

  const donutData = [
    { name: "Principal", value: amount, color: PRINCIPAL_COLOR },
    { name: "Interest", value: totalInterest, color: INTEREST_COLOR },
  ];

  return (
    <div className="glass-card p-7 flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <div className="w-[30px] h-[30px] rounded-lg bg-[var(--color-principal-light)] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">
          Summary
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:items-center">
        <div className="w-[180px] h-[180px] shrink-0 relative mx-auto md:mx-0">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
            <span className="text-[0.6rem] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.08em] mb-1">
              Monthly EMI
            </span>
            <span className="text-[1.15rem] font-extrabold text-[var(--color-text-primary)] tracking-tight">
              {formatINR(emi)}
            </span>
          </div>
          <div className="absolute inset-0 z-10 min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <div>
              <p className="text-[0.68rem] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.06em] mb-[3px]">
                Total Payable
              </p>
              <p className="text-[1.3rem] font-extrabold text-[var(--color-text-primary)] tracking-tight">
                {formatINR(totalPayable)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-[10px] h-[10px] rounded-[3px] bg-[var(--color-principal)] shrink-0" />
                <span className="text-[0.78rem] text-[var(--color-text-secondary)]">Principal</span>
              </div>
              <span className="text-[0.85rem] font-bold text-[var(--color-text-primary)]">
                {formatINR(amount)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-[10px] h-[10px] rounded-[3px] bg-[var(--color-interest)] shrink-0" />
                <span className="text-[0.78rem] text-[var(--color-text-secondary)]">Total Interest</span>
              </div>
              <span className="text-[0.85rem] font-bold text-[var(--color-interest)]">
                {formatINR(totalInterest)}
              </span>
            </div>

            <div className="h-1.5 rounded-full overflow-hidden flex bg-[var(--color-bg-input)] mt-1">
              <div
                className="h-full bg-[var(--color-principal)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ width: `${principalPercent}%` }}
              />
              <div
                className="h-full bg-[var(--color-interest)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ width: `${interestPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[0.68rem] text-[var(--color-text-muted)]">
              <span>{principalPercent.toFixed(1)}% principal</span>
              <span>{interestPercent.toFixed(1)}% interest</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}