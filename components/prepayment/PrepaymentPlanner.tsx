"use client";

import { useState, useCallback, useMemo } from "react";
import { useAppContext } from "@/context/useAppContext";
import { useEMI } from "@/hooks/useEMI";
import { useAmortization } from "@/hooks/useAmortization";
import { formatINR } from "@/utils/format";
import AmortizationSection from "@/components/amortization/AmortizationSection";
import type { Prepayment } from "@/types/state";

interface PrepaymentFormState {
  month: string;
  amount: string;
}

const EMPTY_FORM: PrepaymentFormState = { month: "", amount: "" };

function formatTenure(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mo`;
  if (m === 0) return `${y} yr`;
  return `${y} yr ${m} mo`;
}

function ImpactMetric({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color?: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-[3px]">
      <span className="text-[0.68rem] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.06em]">
        {label}
      </span>
      <span className={`text-[1.05rem] font-extrabold tracking-[-0.02em] ${color ?? 'text-[var(--color-text-primary)]'}`}>
        {value}
      </span>
      {sub && (
        <span className="text-[0.68rem] text-[var(--color-text-muted)]">{sub}</span>
      )}
    </div>
  );
}

function PrepaymentImpactPanel({
  interestSaved,
  tenureReduced,
  newTenure,
  originalTenure,
  newTotalInterest,
  originalTotalInterest,
}: {
  interestSaved: number;
  tenureReduced: number;
  newTenure: number;
  originalTenure: number;
  newTotalInterest: number;
  originalTotalInterest: number;
}) {
  const hasPrepayments = interestSaved > 0 || tenureReduced > 0;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <p className="text-[0.7rem] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.07em]">
          Prepayment Impact
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ImpactMetric
          label="Interest Saved"
          value={interestSaved > 0 ? formatINR(interestSaved) : "₹0"}
          color={hasPrepayments ? "text-[var(--color-interest)]" : "text-[var(--color-text-muted)]"}
          sub="vs original plan"
        />
        <ImpactMetric
          label="Tenure Reduced"
          value={tenureReduced > 0 ? formatTenure(tenureReduced) : "—"}
          color={hasPrepayments ? "text-[var(--color-principal)]" : "text-[var(--color-text-muted)]"}
          sub="months saved"
        />
      </div>

      <div
        className={`h-px ${hasPrepayments ? "bg-[rgba(0,212,170,0.2)]" : "bg-[var(--color-border)]"}`}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[0.65rem] text-[var(--color-text-muted)] font-semibold mb-1.5 uppercase tracking-[0.04em]">
            Original
          </p>
          <p className="text-[0.82rem] font-bold text-[var(--color-text-secondary)] mb-[3px]">
            {formatTenure(originalTenure)}
          </p>
          <p className="text-[0.78rem] text-[var(--color-interest)] font-semibold">
            {formatINR(originalTotalInterest)}
          </p>
        </div>
        <div>
          <p className="text-[0.65rem] text-[var(--color-text-muted)] font-semibold mb-1.5 uppercase tracking-[0.04em]">
            With Prepayment
          </p>
          <p className={`text-[0.82rem] font-bold mb-[3px] ${hasPrepayments ? "text-[var(--color-interest)]" : "text-[var(--color-text-secondary)]"}`}>
            {formatTenure(newTenure)}
          </p>
          <p className={`text-[0.78rem] font-semibold ${hasPrepayments ? "text-[var(--color-interest)]" : "text-[var(--color-text-secondary)]"}`}>
            {formatINR(newTotalInterest)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PrepaymentPlanner() {
  const { state, dispatch } = useAppContext();
  const { loan, prepayments } = state;

  const [form, setForm] = useState<PrepaymentFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<PrepaymentFormState>>({});

  const { emi } = useEMI(loan.amount, loan.rate, loan.tenure);

  const { schedule, breakEvenMonth, interestSaved, tenureReduced, newTenure, newTotalInterest } =
    useAmortization(loan.amount, loan.rate, loan.tenure, emi, prepayments);

  const originalResult = useAmortization(loan.amount, loan.rate, loan.tenure, emi, []);
  const originalTotalInterest = useMemo(
    () => originalResult.schedule.reduce((sum, r) => sum + r.interest, 0),
    [originalResult.schedule]
  );

  const validate = useCallback((): boolean => {
    const errs: Partial<PrepaymentFormState> = {};
    const month = parseInt(form.month, 10);
    const amount = parseFloat(form.amount);

    if (!form.month || isNaN(month) || month < 1) {
      errs.month = "Enter a valid month (≥ 1)";
    } else if (month > loan.tenure) {
      errs.month = `Month must be ≤ ${loan.tenure}`;
    }

    if (!form.amount || isNaN(amount) || amount <= 0) {
      errs.amount = "Enter a valid amount (> 0)";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form, loan.tenure]);

  const handleAdd = useCallback(() => {
    if (!validate()) return;

    const prepayment: Prepayment = {
      id: `pp-${Date.now()}`,
      month: parseInt(form.month, 10),
      amount: parseFloat(form.amount),
    };

    dispatch({ type: "ADD_PREPAYMENT", payload: prepayment });
    setForm(EMPTY_FORM);
    setErrors({});
  }, [validate, form, dispatch]);

  const handleRemove = useCallback(
    (id: string) => {
      dispatch({ type: "REMOVE_PREPAYMENT", payload: id });
    },
    [dispatch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleAdd();
    },
    [handleAdd]
  );

  const sortedPrepayments = useMemo(
    () => [...prepayments].sort((a, b) => a.month - b.month),
    [prepayments]
  );

  const getInputClass = (hasError: boolean) =>
    `w-full bg-[var(--color-bg-input)] border rounded-[10px] py-2.5 px-3.5 text-[var(--color-text-primary)] text-[0.875rem] font-[inherit] outline-none transition-all duration-200 focus:border-[var(--color-principal)] focus:shadow-[0_0_0_3px_var(--color-principal-light)] ${
      hasError ? "border-[var(--color-danger)] shadow-[0_0_0_3px_rgba(255,92,124,0.12)]" : "border-[var(--color-border)] shadow-none"
    } [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]`;

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-7 flex flex-col gap-[22px]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-[30px] h-[30px] rounded-lg bg-[var(--color-interest-light)] flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-interest)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">
              Prepayment Planner
            </h2>
          </div>
          <p className="text-[0.72rem] text-[var(--color-text-muted)] ml-10">
            Schedule lump-sum payments and visualize interest savings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-4">
            <p className="text-[0.8rem] font-bold text-[var(--color-text-secondary)]">
              Schedule a prepayment
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.72rem] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.05em]">
                  Month
                </label>
                <input
                  type="number"
                  placeholder={`1 – ${loan.tenure}`}
                  value={form.month}
                  min={1}
                  max={loan.tenure}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, month: e.target.value }));
                    setErrors((er) => ({ ...er, month: undefined }));
                  }}
                  onKeyDown={handleKeyDown}
                  className={getInputClass(!!errors.month)}
                />
                {errors.month && (
                  <p className="text-[0.68rem] text-[var(--color-danger)] font-medium">
                    {errors.month}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.72rem] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.05em]">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100000"
                  value={form.amount}
                  min={1}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, amount: e.target.value }));
                    setErrors((er) => ({ ...er, amount: undefined }));
                  }}
                  onKeyDown={handleKeyDown}
                  className={getInputClass(!!errors.amount)}
                />
                {errors.amount && (
                  <p className="text-[0.68rem] text-[var(--color-danger)] font-medium">
                    {errors.amount}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="btn-primary w-full"
            >
              + Add Prepayment
            </button>

            {sortedPrepayments.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-[0.72rem] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.05em]">
                  Scheduled ({sortedPrepayments.length})
                </p>
                <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {sortedPrepayments.map((pp) => (
                    <div
                      key={pp.id}
                      className="flex items-center justify-between py-2.5 px-3.5 rounded-[10px] bg-[var(--color-bg-input)] border border-[var(--color-border)] transition-colors duration-150 hover:border-[var(--color-interest)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="py-[3px] px-2 rounded-md bg-[var(--color-interest-light)] border border-[var(--color-interest-light)]">
                          <span className="text-[0.68rem] font-bold text-[var(--color-interest)]">
                            Mo {pp.month}
                          </span>
                        </div>
                        <span className="text-[0.85rem] font-bold text-[var(--color-text-primary)]">
                          {formatINR(pp.amount)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemove(pp.id)}
                        className="w-6 h-6 rounded-md border-none bg-transparent text-[var(--color-text-muted)] cursor-pointer flex items-center justify-center transition-all duration-150 hover:text-[var(--color-danger)] hover:bg-[rgba(255,92,124,0.1)]"
                        aria-label="Remove prepayment"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-5 text-center border-2 border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-text-muted)] text-[0.78rem]">
                No prepayments yet. Add one above to see the impact.
              </div>
            )}
          </div>

          <PrepaymentImpactPanel
            interestSaved={interestSaved}
            tenureReduced={tenureReduced}
            newTenure={newTenure}
            originalTenure={loan.tenure}
            newTotalInterest={newTotalInterest}
            originalTotalInterest={originalTotalInterest}
          />
        </div>
      </div>

      <AmortizationSection
        schedule={schedule}
        breakEvenMonth={breakEvenMonth}
        showPrepayment={true}
        title="Adjusted Schedule"
        subtitle="Amortization reflecting your prepayments"
      />
    </div>
  );
}