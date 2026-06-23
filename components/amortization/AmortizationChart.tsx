"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { AmortizationRow } from "@/types/state";
import { formatINR } from "@/utils/format";

interface AmortizationChartProps {
  schedule: AmortizationRow[];
  breakEvenMonth: number;
}

interface ChartDataPoint {
  month: number;
  Principal: number;
  Interest: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
  label?: number;
}) => {
  if (!active || !payload?.length) return null;

  const principal = payload.find((p) => p.name === "Principal")?.value ?? 0;
  const interest = payload.find((p) => p.name === "Interest")?.value ?? 0;

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-bright)] rounded-xl py-3 px-4 shadow-[0_12px_32px_rgba(0,0,0,0.3)] min-w-[170px]">
      <p className="text-[0.7rem] font-bold text-[var(--color-text-muted)] mb-2.5 uppercase tracking-[0.06em]">
        Month {label}
      </p>
      <div className="flex flex-col gap-[7px]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-[7px]">
            <div className="w-2 h-2 rounded-sm bg-[var(--color-principal)]" />
            <span className="text-[0.75rem] text-[var(--color-text-secondary)]">Principal</span>
          </div>
          <span className="text-[0.78rem] font-bold text-[var(--color-text-primary)]">
            {formatINR(principal)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-[7px]">
            <div className="w-2 h-2 rounded-sm bg-[var(--color-interest)]" />
            <span className="text-[0.75rem] text-[var(--color-text-secondary)]">Interest</span>
          </div>
          <span className="text-[0.78rem] font-bold text-[var(--color-text-primary)]">
            {formatINR(interest)}
          </span>
        </div>
        <div className="h-px bg-[var(--color-border)] my-0.5" />
        <div className="flex items-center justify-between gap-4">
          <span className="text-[0.75rem] text-[var(--color-text-muted)]">Total EMI</span>
          <span className="text-[0.82rem] font-extrabold text-[var(--color-principal)]">
            {formatINR(principal + interest)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function AmortizationChart({
  schedule,
  breakEvenMonth,
}: AmortizationChartProps) {
  const data = useMemo<ChartDataPoint[]>(
    () =>
      schedule.map((row) => ({
        month: row.month,
        Principal: Math.round(row.principal),
        Interest: Math.round(row.interest),
      })),
    [schedule]
  );

  const tickInterval = Math.max(0, Math.floor(schedule.length / 8) - 1);

  return (
    <div className="w-full h-[280px] min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <BarChart
          data={data}
          barCategoryGap="15%"
          margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
        >
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "var(--color-text-muted)", fontFamily: "Plus Jakarta Sans" }}
            tickLine={false}
            axisLine={false}
            interval={tickInterval}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-text-muted)", fontFamily: "Plus Jakarta Sans" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            width={52}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "var(--color-border)", opacity: 0.3, radius: 4 }}
          />

          {breakEvenMonth > 0 && (
            <ReferenceLine
              x={breakEvenMonth}
              stroke="var(--color-interest)"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{
                value: "BE",
                position: "top",
                fontSize: 10,
                fill: "var(--color-interest)",
                fontWeight: 700,
                fontFamily: "Plus Jakarta Sans",
              }}
            />
          )}

          <Bar dataKey="Principal" stackId="emi" fill="var(--color-principal)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Interest" stackId="emi" fill="var(--color-interest)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}