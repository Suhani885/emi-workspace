"use client";

import { useMemo } from "react";
import { calculateEMI, calculateTotals } from "@/utils/emi";
import type { EMIResult } from "@/types/state";

export function useEMI(amount: number, rate: number, tenure: number): EMIResult {
  return useMemo(() => {
    const emi = calculateEMI(amount, rate, tenure);
    const { totalPayable, totalInterest, principalPercent, interestPercent } =
      calculateTotals(emi, amount, tenure);

    return { emi, totalPayable, totalInterest, principalPercent, interestPercent };
  }, [amount, rate, tenure]);
}