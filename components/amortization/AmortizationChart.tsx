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
  CartesianGrid,
  Cell,
} from "recharts";
import type { AmortizationRow } from "@/types/state";
import { formatINR } from "@/utils/format";

interface AmortizationChartProps {
  schedule: AmortizationRow[];
  breakEvenMonth: number;
}

interface ChartDataPoint {
  label: string;
  yearIndex: number;
  Principal: number;
  Interest: number;
}

function formatYAxis(v: number): string {
  if (v >= 100000) return `₹${(v / 100000).toFixed(0)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}k`;
  return `₹${v}`;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const principal = payload.find((p) => p.name === "Principal")?.value ?? 0;
  const interest = payload.find((p) => p.name === "Interest")?.value ?? 0;
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-bright)] rounded-xl py-3 px-4 shadow-[0_12px_32px_rgba(0,0,0,0.3)] min-w-[160px]">
      <p className="text-[0.68rem] font-bold text-[var(--color-text-muted)] mb-2.5 uppercase tracking-[0.06em]">
        {label}
      </p>
      <div className="flex flex-col gap-[6px]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-[var(--color-principal)]" />
            <span className="text-[0.72rem] text-[var(--color-text-secondary)]">Principal</span>
          </div>
          <span className="text-[0.75rem] font-bold text-[var(--color-text-primary)]">
            {formatINR(principal)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-[var(--color-interest)]" />
            <span className="text-[0.72rem] text-[var(--color-text-secondary)]">Interest</span>
          </div>
          <span className="text-[0.75rem] font-bold text-[var(--color-text-primary)]">
            {formatINR(interest)}
          </span>
        </div>
        <div className="h-px bg-[var(--color-border)] my-0.5" />
        <div className="flex items-center justify-between gap-4">
          <span className="text-[0.72rem] text-[var(--color-text-muted)]">Total</span>
          <span className="text-[0.78rem] font-extrabold text-[var(--color-principal)]">
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
  const { data, breakEvenLabel } = useMemo<{
    data: ChartDataPoint[];
    breakEvenLabel: string | null;
  }>(() => {
    const totalMonths = schedule.length;

    const groupSize = totalMonths <= 14 ? 1 : totalMonths <= 48 ? 3 : 12;
    const isYearly = groupSize === 12;
    const isQuarterly = groupSize === 3;

    const buckets: Map<number, { principal: number; interest: number }> = new Map();
    schedule.forEach((row) => {
      const bucket = Math.ceil(row.month / groupSize);
      const existing = buckets.get(bucket) ?? { principal: 0, interest: 0 };
      buckets.set(bucket, {
        principal: existing.principal + row.principal,
        interest: existing.interest + row.interest,
      });
    });

    const points: ChartDataPoint[] = Array.from(buckets.entries()).map(([idx, d]) => ({
      label: isYearly
        ? `Yr ${idx}`
        : isQuarterly
        ? `Q${idx}`
        : `Mo ${idx}`,
      yearIndex: idx,
      Principal: Math.round(d.principal),
      Interest: Math.round(d.interest),
    }));

    const beLabel =
      breakEvenMonth > 0
        ? points[Math.ceil(breakEvenMonth / groupSize) - 1]?.label ?? null
        : null;

    return { data: points, breakEvenLabel: beLabel };
  }, [schedule, breakEvenMonth]);

  const maxValue = useMemo(
    () => Math.max(...data.map((d) => d.Principal + d.Interest), 1),
    [data]
  );

  return (
    <div className="w-full h-[260px] sm:h-[300px] min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <BarChart
          data={data}
          barCategoryGap="28%"
          barGap={3}
          margin={{ top: 10, right: 8, left: 0, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
            opacity={0.7}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--color-text-muted)", fontFamily: "Plus Jakarta Sans" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 11, fill: "var(--color-text-muted)", fontFamily: "Plus Jakarta Sans" }}
            tickLine={false}
            axisLine={false}
            width={48}
            domain={[0, Math.ceil(maxValue * 1.1)]}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "var(--color-bg-input)", opacity: 0.5, radius: 6 }}
          />

          {breakEvenLabel && (
            <ReferenceLine
              x={breakEvenLabel}
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

          <Bar
            dataKey="Principal"
            fill="var(--color-principal)"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            dataKey="Interest"
            fill="var(--color-interest)"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
