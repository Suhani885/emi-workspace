"use client";

import { useCallback, useMemo } from "react";
import { useAppContext } from "@/context/useAppContext";
import { calculateEMI, calculateTotals } from "@/utils/emi";
import { formatINR } from "@/utils/format";
import SliderInput from "@/components/calculator/SliderInput";
import type { Scenario } from "@/types/state";

const AMOUNT_MIN = 10000;
const AMOUNT_MAX = 5000000;
const RATE_MIN = 1;
const RATE_MAX = 36;
const TENURE_MIN = 1;
const TENURE_MAX = 84;

interface ScenarioResult {
  emi: number;
  totalInterest: number;
  totalPayable: number;
}

function computeScenario(s: Scenario): ScenarioResult {
  const emi = calculateEMI(s.amount, s.rate, s.tenure);
  const { totalInterest, totalPayable } = calculateTotals(emi, s.amount, s.tenure);
  return { emi, totalInterest, totalPayable };
}

interface ScenarioCardProps {
  scenario: Scenario;
  result: ScenarioResult;
  isBest: boolean;
  isWorst: boolean;
  onUpdate: (id: string, updates: Partial<Scenario>) => void;
  onRemove: (id: string) => void;
}

function ScenarioCard({ scenario, result, isBest, isWorst, onUpdate, onRemove }: ScenarioCardProps) {
  return (
    <div
      className={`relative rounded-[18px] border-[1.5px] p-5 flex flex-col gap-4 transition-shadow duration-200 ${
        isBest
          ? "border-[var(--color-principal)] bg-[var(--color-principal-light)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-card)]"
      }`}
    >
      {isBest && (
        <div className="absolute -top-3 left-4 py-[3px] px-2.5 rounded-full bg-[var(--color-principal)] text-white text-[0.62rem] font-extrabold uppercase tracking-[0.08em] shadow-[0_4px_12px_var(--color-principal-glow)]">
          Best Value
        </div>
      )}

      <div className="flex items-center justify-between">
        <input
          type="text"
          value={scenario.name}
          onChange={(e) => onUpdate(scenario.id, { name: e.target.value })}
          className="text-[0.9rem] font-bold text-[var(--color-text-primary)] bg-transparent border-none outline-none w-40 font-[inherit]"
        />
        <button
          onClick={() => onRemove(scenario.id)}
          className="w-6 h-6 rounded-md bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-muted)] cursor-pointer flex items-center justify-center transition-all duration-150 hover:bg-[rgba(255,92,124,0.1)] hover:text-[var(--color-danger)] hover:border-[rgba(255,92,124,0.3)]"
          aria-label="Remove scenario"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <SliderInput
          label="Amount"
          value={scenario.amount}
          min={AMOUNT_MIN}
          max={AMOUNT_MAX}
          step={10000}
          onChange={(v) => onUpdate(scenario.id, { amount: v })}
          prefix="₹"
          minLabel="₹10k"
          maxLabel="₹50L"
          accentColor="var(--color-principal)"
        />
        <SliderInput
          label="Rate"
          value={scenario.rate}
          min={RATE_MIN}
          max={RATE_MAX}
          step={0.1}
          onChange={(v) => onUpdate(scenario.id, { rate: v })}
          suffix="%"
          minLabel="1%"
          maxLabel="36%"
        />
        <SliderInput
          label="Tenure"
          value={scenario.tenure}
          min={TENURE_MIN}
          max={TENURE_MAX}
          step={1}
          onChange={(v) => onUpdate(scenario.id, { tenure: v })}
          suffix=" mo"
          minLabel="1 mo"
          maxLabel="84 mo"
        />
      </div>

      <div className="border-t border-[var(--color-border)] pt-3.5 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-[0.72rem] text-[var(--color-text-muted)] font-semibold uppercase tracking-[0.05em]">
            Monthly EMI
          </span>
          <span className="text-[1.2rem] font-extrabold text-[var(--color-principal)] tracking-[-0.02em]">
            {formatINR(result.emi)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[0.72rem] text-[var(--color-text-muted)]">Total Interest</span>
          <span className="text-[0.85rem] font-semibold text-[var(--color-text-secondary)]">
            {formatINR(result.totalInterest)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[0.72rem] text-[var(--color-text-muted)]">Total Payable</span>
          <span
            className={`text-[0.9rem] font-extrabold ${
              isBest ? "text-[var(--color-principal)]" : "text-[var(--color-text-primary)]"
            }`}
          >
            {formatINR(result.totalPayable)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CompareScenarios() {
  const { state, dispatch } = useAppContext();
  const { scenarios } = state;

  const results = useMemo(() => scenarios.map(computeScenario), [scenarios]);

  const bestIndex = useMemo(() => {
    if (results.length === 0) return -1;
    let minIdx = 0;
    results.forEach((r, i) => {
      if (r.totalPayable < results[minIdx].totalPayable) minIdx = i;
    });
    return minIdx;
  }, [results]);

  const worstIndex = useMemo(() => {
    if (results.length < 2) return -1;
    let maxIdx = 0;
    results.forEach((r, i) => {
      if (r.totalPayable > results[maxIdx].totalPayable) maxIdx = i;
    });
    return maxIdx;
  }, [results]);

  const handleUpdate = useCallback(
    (id: string, updates: Partial<Scenario>) => {
      dispatch({ type: "UPDATE_SCENARIO", payload: { id, updates } });
    },
    [dispatch]
  );

  const handleRemove = useCallback(
    (id: string) => {
      dispatch({ type: "REMOVE_SCENARIO", payload: id });
    },
    [dispatch]
  );

  const handleAdd = useCallback(() => {
    const newScenario: Scenario = {
      id: `scenario-${Date.now()}`,
      name: `Scenario ${scenarios.length + 1}`,
      amount: state.loan.amount,
      rate: state.loan.rate,
      tenure: state.loan.tenure,
    };
    dispatch({ type: "ADD_SCENARIO", payload: newScenario });
  }, [dispatch, scenarios.length, state.loan]);

  return (
    <div className="glass-card p-7 flex flex-col gap-[22px]">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-[30px] h-[30px] rounded-lg bg-[var(--color-interest-light)] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-interest)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">
              Compare Scenarios
            </h2>
          </div>
          <p className="text-[0.72rem] text-[var(--color-text-muted)] ml-10">
            Configure up to 3 scenarios — lowest total cost highlighted
          </p>
        </div>

        {scenarios.length < 3 && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 py-[9px] px-[18px] rounded-[10px] bg-[var(--color-principal-light)] border border-[var(--color-principal-glow)] text-[var(--color-principal)] text-[0.8rem] font-bold cursor-pointer font-[inherit] transition-all duration-200 shrink-0 hover:bg-[var(--color-principal)] hover:text-white hover:shadow-[0_4px_16px_var(--color-principal-glow)]"
          >
            + Add Scenario
          </button>
        )}
      </div>

      {scenarios.length === 0 ? (
        <div className="py-[60px] px-6 text-center text-[var(--color-text-muted)] text-[0.875rem] border-2 border-dashed border-[var(--color-border)] rounded-[14px]">
          <div className="text-[2rem] mb-3">⚖️</div>
          <p className="font-semibold text-[var(--color-text-secondary)] mb-1.5">
            No scenarios yet
          </p>
          <p className="text-[0.78rem]">
            Add up to 3 loan scenarios to compare costs side-by-side
          </p>
        </div>
      ) : (
        <div className={`grid gap-4 grid-cols-1 ${scenarios.length > 1 ? 'md:grid-cols-2' : ''} ${scenarios.length > 2 ? 'lg:grid-cols-3' : ''}`}>
          {scenarios.map((scenario, index) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              result={results[index]}
              isBest={index === bestIndex}
              isWorst={scenarios.length > 1 && index === worstIndex}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}