"use client";

import { useCallback } from "react";
import { useAppContext } from "@/context/useAppContext";
import SliderInput from "./SliderInput";

const AMOUNT_MIN = 10000;
const AMOUNT_MAX = 5000000;
const AMOUNT_STEP = 10000;

const RATE_MIN = 1;
const RATE_MAX = 36;
const RATE_STEP = 0.1;

const TENURE_MIN = 1;
const TENURE_MAX = 84;
const TENURE_STEP = 1;

export default function LoanInputs() {
  const { state, dispatch } = useAppContext();
  const { amount, rate, tenure } = state.loan;

  const handleAmountChange = useCallback(
    (value: number) => dispatch({ type: "SET_LOAN", payload: { amount: value } }),
    [dispatch]
  );

  const handleRateChange = useCallback(
    (value: number) => dispatch({ type: "SET_LOAN", payload: { rate: value } }),
    [dispatch]
  );

  const handleTenureChange = useCallback(
    (value: number) => dispatch({ type: "SET_LOAN", payload: { tenure: value } }),
    [dispatch]
  );

  return (
    <div className="glass-card p-4 sm:p-6 flex flex-col gap-5 sm:gap-6 relative overflow-hidden">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-[36px] h-[36px] rounded-xl bg-[var(--color-principal-light)] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
            Loan Details
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <SliderInput
          label="Loan Amount"
          helperText="The total amount you plan to borrow."
          value={amount}
          min={AMOUNT_MIN}
          max={AMOUNT_MAX}
          step={AMOUNT_STEP}
          onChange={handleAmountChange}
          prefix="₹"
          minLabel="₹10k"
          maxLabel="₹50L"
        />

        <div className="h-px bg-[var(--color-border)]" />

        <SliderInput
          label="Annual Interest Rate"
          helperText="The percentage of the loan amount charged by the lender annually."
          value={rate}
          min={RATE_MIN}
          max={RATE_MAX}
          step={RATE_STEP}
          onChange={handleRateChange}
          suffix="%"
          minLabel="1%"
          maxLabel="36%"
        />

        <div className="h-px bg-[var(--color-border)]" />

        <SliderInput
          label="Loan Tenure"
          helperText="The duration over which you will repay the loan."
          value={tenure}
          min={TENURE_MIN}
          max={TENURE_MAX}
          step={TENURE_STEP}
          onChange={handleTenureChange}
          suffix=" mo"
          minLabel="1 mo"
          maxLabel="84 mo"
        />
      </div>

      <div className="py-3.5 px-4 bg-[var(--color-bg-input)] rounded-[12px] border border-[var(--color-border)] text-[0.75rem] text-[var(--color-text-muted)] leading-relaxed">
        <span className="text-[var(--color-text-secondary)] font-bold">Reducing-balance method</span>{" "}
        — interest charged only on outstanding principal each month.
      </div>
    </div>
  );
}