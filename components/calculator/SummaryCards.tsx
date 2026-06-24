"use client";

import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { useAppContext } from "@/context/useAppContext";
import { useEMI } from "@/hooks/useEMI";
import { formatINR } from "@/utils/format";
import { useState, useEffect } from "react";
import Tooltip from "@/components/ui/Tooltip";

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
    <div className="glass-card p-3 sm:p-6">
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-5 rounded-full bg-[var(--color-principal)]"></div>
        <h2 className="text-[0.8rem] font-extrabold uppercase tracking-[0.08em] text-[var(--color-text-primary)]">
          Summary
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 items-center justify-between mt-3 sm:mt-6 min-h-[220px] lg:min-h-[248px]">
        <div className="w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] shrink-0 relative mx-auto lg:mx-0">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
            <span className="text-[0.58rem] sm:text-[0.75rem] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.1em] mb-1">
              Monthly EMI
            </span>
            <span
              key={emi.toFixed(0)}
              className="text-[1rem] sm:text-[1.5rem] font-extrabold text-[var(--color-text-primary)] tracking-tight animate-count-up"
            >
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
                  innerRadius="62%"
                  outerRadius="88%"
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col items-center justify-between pb-3 border-b border-[var(--color-border)] md:flex-row md:items-start md:justify-between">
            <div>
              <Tooltip
                content="(Principal + Interest)"
                tipClassName="normal-case tracking-normal"
                className="w-max mb-1"
              >
                <p className="text-[0.75rem] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.08em] border-b border-dashed border-[var(--color-text-muted)] pb-[1px]">
                  Total Payable
                </p>
              </Tooltip>
              <p className="text-[1.1rem] sm:text-[1.7rem] font-extrabold text-[var(--color-text-primary)] tracking-tight whitespace-nowrap tabular-nums">
                {formatINR(totalPayable)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5">
                <Tooltip
                  content="Original sum borrowed"
                  tipClassName="left-5"
                  className="flex items-center gap-2.5 w-max"
                >
                  <div className="w-[12px] h-[12px] rounded-[4px] bg-[var(--color-principal)] shrink-0" />
                  <span className="text-[0.9rem] font-medium text-[var(--color-text-secondary)] border-b border-dashed border-[var(--color-text-muted)] pb-[1px]">Principal Amount</span>
                </Tooltip>
              </div>
              <span className="text-[0.85rem] sm:text-[1rem] font-bold text-[var(--color-text-primary)]">
                {formatINR(amount)}
              </span>
            </div>

            <div className="flex items-start justify-between mt-2">
              <div className="flex flex-col gap-0.5">
                <Tooltip
                  content="Extra amount paid"
                  tipClassName="left-5"
                  className="flex items-center gap-2.5 w-max"
                >
                  <div className="w-[12px] h-[12px] rounded-[4px] bg-[var(--color-interest)] shrink-0" />
                  <span className="text-[0.9rem] font-medium text-[var(--color-text-secondary)] border-b border-dashed border-[var(--color-text-muted)] pb-[1px]">Total Interest</span>
                </Tooltip>
              </div>
              <span className="text-[0.85rem] sm:text-[1rem] font-bold text-[var(--color-interest)]">
                {formatINR(totalInterest)}
              </span>
            </div>

            <div className="h-2 rounded-full overflow-hidden flex bg-[var(--color-bg-input)] mt-2">
              <div
                className="h-full bg-[var(--color-principal)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ width: `${principalPercent}%` }}
              />
              <div
                className="h-full bg-[var(--color-interest)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ width: `${interestPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[0.75rem] font-medium text-[var(--color-text-muted)] mt-1">
              <span>{principalPercent.toFixed(1)}% principal</span>
              <span>{interestPercent.toFixed(1)}% interest</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}