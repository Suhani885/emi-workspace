"use client";

import { useMemo } from "react";
import { buildSchedule, findBreakEvenMonth } from "@/utils/amortization";
import type { Prepayment, PrepaymentResult } from "@/types/state";

interface UseAmortizationResult extends PrepaymentResult {
  breakEvenMonth: number;
}

export function useAmortization(
  amount: number,
  rate: number,
  tenure: number,
  emi: number,
  prepayments: Prepayment[]
): UseAmortizationResult {
  return useMemo(() => {
    const result = buildSchedule(amount, rate, tenure, emi, prepayments);
    const breakEvenMonth = findBreakEvenMonth(result.schedule);
    return { ...result, breakEvenMonth };
  }, [amount, rate, tenure, emi, prepayments]);
}