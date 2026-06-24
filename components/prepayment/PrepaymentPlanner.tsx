"use client";

import { useState, useCallback, useMemo } from "react";
import { useAppContext } from "@/context/useAppContext";
import { useEMI } from "@/hooks/useEMI";
import { useAmortization } from "@/hooks/useAmortization";
import { formatINR } from "@/utils/format";
import AmortizationSection from "@/components/amortization/AmortizationSection";
import type { Prepayment } from "@/types/state";
import Tooltip from "@/components/ui/Tooltip";

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
  const savingsPercent = originalTotalInterest > 0
    ? Math.round((interestSaved / originalTotalInterest) * 100)
    : 0;
  const savingsBarWidth = Math.min(100, savingsPercent);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-5 flex flex-col gap-4 min-h-[280px] h-fit md:self-start w-full">
      <div className="flex items-center justify-between gap-2 min-h-[22px]">
        <p className="text-[0.7rem] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.07em]">
          Prepayment Impact
        </p>
        <span
          className="text-[0.7rem] font-extrabold text-[var(--color-interest)] bg-[var(--color-interest-light)] px-2 py-0.5 rounded-full transition-opacity duration-300"
          style={{ opacity: hasPrepayments ? 1 : 0 }}
        >
          −{savingsPercent}% interest
        </span>
      </div>

      <div
        className="flex flex-col gap-1.5 transition-opacity duration-300"
        style={{ opacity: hasPrepayments ? 1 : 0 }}
      >
        <div className="flex justify-between text-[0.65rem] text-[var(--color-text-muted)] font-medium">
          <span>Interest savings</span>
          <span className="text-[var(--color-interest)] font-bold">{formatINR(interestSaved)}</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-interest)] transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${savingsBarWidth}%` }}
          />
        </div>
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

      <div className="h-px bg-[var(--color-border)]" />

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
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const handleSubmit = useCallback(() => {
    if (!validate()) return;

    if (editingId) {
      const updated: Prepayment = {
        id: editingId,
        month: parseInt(form.month, 10),
        amount: parseFloat(form.amount),
      };
      dispatch({ type: "UPDATE_PREPAYMENT", payload: updated });
      setEditingId(null);
    } else {
      const prepayment: Prepayment = {
        id: `pp-${Date.now()}`,
        month: parseInt(form.month, 10),
        amount: parseFloat(form.amount),
      };
      dispatch({ type: "ADD_PREPAYMENT", payload: prepayment });
    }
    setForm(EMPTY_FORM);
    setErrors({});
  }, [validate, form, dispatch, editingId]);

  const handleEdit = useCallback((pp: Prepayment) => {
    setEditingId(pp.id);
    setForm({ month: String(pp.month), amount: String(pp.amount) });
    setErrors({});
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  }, []);

  const handleRemove = useCallback(
    (id: string) => {
      dispatch({ type: "REMOVE_PREPAYMENT", payload: id });
      if (editingId === id) {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setErrors({});
      }
    },
    [dispatch, editingId]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSubmit();
    },
    [handleSubmit]
  );

  const sortedPrepayments = useMemo(
    () => [...prepayments].sort((a, b) => a.month - b.month),
    [prepayments]
  );

  const groupedPrepayments = useMemo(() => {
    const map = new Map<number, Prepayment[]>();
    for (const pp of sortedPrepayments) {
      const arr = map.get(pp.month) ?? [];
      arr.push(pp);
      map.set(pp.month, arr);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([month, items]) => ({
        month,
        total: items.reduce((s, p) => s + p.amount, 0),
        items,
      }));
  }, [sortedPrepayments]);

  const getInputClass = (hasError: boolean) =>
    `w-full bg-[var(--color-bg-input)] border rounded-[10px] py-2.5 px-3.5 text-[var(--color-text-primary)] text-[0.875rem] font-[inherit] outline-none transition-all duration-200 focus:border-[var(--color-principal)] focus:shadow-[0_0_0_3px_var(--color-principal-light)] ${
      hasError ? "border-[var(--color-danger)] shadow-[0_0_0_3px_rgba(255,92,124,0.12)]" : "border-[var(--color-border)] shadow-none"
    } [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]`;

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-4 sm:p-7 flex flex-col gap-4 sm:gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-[var(--color-interest)]"></div>
            <Tooltip
              content="Schedule lump-sum payments and visualize interest savings"
              className="w-max"
            >
              <h2 className="text-[0.8rem] font-extrabold uppercase tracking-[0.08em] text-[var(--color-text-primary)] border-b border-dashed border-[var(--color-text-muted)] pb-[1px]">
                Prepayment Planner
              </h2>
            </Tooltip>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[0.8rem] font-bold text-[var(--color-text-secondary)]">
                {editingId ? "Edit prepayment" : "Schedule a prepayment"}
              </p>
              {editingId && (
                <button
                  onClick={handleCancelEdit}
                  className="text-[0.72rem] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors duration-150"
                >
                  Cancel
                </button>
              )}
            </div>

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
              onClick={handleSubmit}
              className={`btn-primary w-full ${editingId ? "bg-[var(--color-interest)] shadow-[0_4px_16px_var(--color-interest-light)]" : ""}`}
            >
              {editingId ? "✓ Update Prepayment" : "+ Add Prepayment"}
            </button>

            {groupedPrepayments.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-[0.72rem] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.05em]">
                  Scheduled ({groupedPrepayments.length} month{groupedPrepayments.length !== 1 ? "s" : ""}, {sortedPrepayments.length} payment{sortedPrepayments.length !== 1 ? "s" : ""})
                </p>
                <div className="flex flex-col gap-1.5 max-h-[168px] overflow-y-auto pr-1">
                  {groupedPrepayments.map(({ month, total, items }) => {
                    const isGroupEditing = items.some((pp) => editingId === pp.id);
                    return (
                      <div
                        key={month}
                        className={`rounded-[10px] bg-[var(--color-bg-input)] border transition-colors duration-150 ${
                          isGroupEditing
                            ? "border-[var(--color-interest)] shadow-[0_0_0_2px_var(--color-interest-light)]"
                            : "border-[var(--color-border)]"
                        }`}
                      >
                        <div className="flex items-center justify-between py-2.5 px-3.5">
                          <div className="flex items-center gap-3">
                            <div className="py-[3px] px-2 rounded-md bg-[var(--color-interest-light)] border border-[var(--color-interest-light)]">
                              <span className="text-[0.68rem] font-bold text-[var(--color-interest)]">
                                Mo {month}
                              </span>
                            </div>
                            <div className="flex flex-col gap-[1px]">
                              <span className="text-[0.85rem] font-bold text-[var(--color-text-primary)]">
                                {formatINR(total)}
                              </span>
                              {items.length > 1 && (
                                <span className="text-[0.62rem] text-[var(--color-text-muted)] font-medium">
                                  {items.length} payments
                                </span>
                              )}
                            </div>
                          </div>
                          {items.length === 1 && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEdit(items[0])}
                                className="w-6 h-6 rounded-md border-none bg-transparent text-[var(--color-text-muted)] cursor-pointer flex items-center justify-center transition-all duration-150 hover:text-[var(--color-interest)] hover:bg-[var(--color-interest-light)]"
                                aria-label="Edit prepayment"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleRemove(items[0].id)}
                                className="w-6 h-6 rounded-md border-none bg-transparent text-[var(--color-text-muted)] cursor-pointer flex items-center justify-center transition-all duration-150 hover:text-[var(--color-danger)] hover:bg-[rgba(255,92,124,0.1)]"
                                aria-label="Remove prepayment"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"/>
                                  <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        {items.length > 1 && (
                          <div className="flex flex-col border-t border-[var(--color-border)]">
                            {items.map((pp) => (
                              <div
                                key={pp.id}
                                className={`flex items-center justify-between py-1.5 px-3.5 pl-[3.25rem] border-b border-[var(--color-border)] last:border-b-0 transition-colors duration-150 ${
                                  editingId === pp.id ? "bg-[var(--color-interest-light)]" : "hover:bg-[var(--color-bg-input-hover)]"
                                }`}
                              >
                                <span className="text-[0.78rem] text-[var(--color-text-secondary)] font-semibold tabular-nums">
                                  {formatINR(pp.amount)}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEdit(pp)}
                                    className="w-6 h-6 rounded-md border-none bg-transparent text-[var(--color-text-muted)] cursor-pointer flex items-center justify-center transition-all duration-150 hover:text-[var(--color-interest)] hover:bg-[var(--color-interest-light)]"
                                    aria-label="Edit prepayment"
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                  </button>
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
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-5 text-center border-2 border-dashed border-[var(--color-border)] rounded-xl flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-bg-input-hover)] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <p className="text-[0.75rem] font-semibold text-[var(--color-text-muted)]">No prepayments scheduled</p>
                <p className="text-[0.7rem] text-[var(--color-text-muted)] opacity-70">Add one above to see interest savings</p>
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
