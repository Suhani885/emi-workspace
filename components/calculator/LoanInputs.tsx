"use client";

import { useCallback } from "react";
import { useAppContext } from "@/context/useAppContext";
import SliderInput from "./SliderInput";
import Tooltip from "@/components/ui/Tooltip";

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
    <div className="glass-card p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 relative overflow-hidden h-fit md:self-start w-full">
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-1 h-5 rounded-full bg-[var(--color-principal)]"></div>
          <Tooltip
            content={
              <><span className="font-bold opacity-90">Reducing-balance method</span> — interest charged only on outstanding principal each month.</>
            }
            className="w-max"
          >
            <h2 className="text-[0.8rem] font-extrabold uppercase tracking-[0.08em] text-[var(--color-text-primary)] border-b border-dashed border-[var(--color-text-muted)] pb-[1px]">
              Loan Details
            </h2>
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
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


    </div>
  );
}