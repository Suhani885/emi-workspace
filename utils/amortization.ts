import type { AmortizationRow, Prepayment, PrepaymentResult } from "@/types/state";
import { calculateEMI } from "./emi";

export function buildSchedule(
  P: number,
  annualRate: number,
  n: number,
  emi: number,
  prepayments: Prepayment[] = []
): PrepaymentResult {
  if (P <= 0 || annualRate <= 0 || n <= 0 || emi <= 0) {
    return { schedule: [], interestSaved: 0, tenureReduced: 0, newTenure: 0, newTotalInterest: 0 };
  }

  const r = annualRate / 12 / 100;
  const prepaymentMap = new Map<number, number>();

  prepayments.forEach(({ month, amount }) => {
    if (month >= 1 && month <= n) {
      prepaymentMap.set(month, (prepaymentMap.get(month) ?? 0) + amount);
    }
  });

  const schedule: AmortizationRow[] = [];
  let balance = P;
  let totalInterestPaid = 0;
  let month = 1;

  while (balance > 0.01 && month <= n) {
    const prepaymentThisMonth = prepaymentMap.get(month) ?? 0;
    const cappedPrepayment = Math.min(prepaymentThisMonth, balance);

    if (cappedPrepayment > 0) {
      balance = Math.round((balance - cappedPrepayment) * 100) / 100;
    }

    if (balance <= 0.01) {
      schedule.push({
        month,
        emi: 0,
        principal: 0,
        interest: 0,
        prepayment: cappedPrepayment,
        balance: 0,
      });
      break;
    }

    const interestPaid = Math.round(balance * r * 100) / 100;
    let principalPaid = Math.round((emi - interestPaid) * 100) / 100;

    if (principalPaid > balance) principalPaid = balance;

    const newBalance = Math.round((balance - principalPaid) * 100) / 100;

    totalInterestPaid = Math.round((totalInterestPaid + interestPaid) * 100) / 100;

    schedule.push({
      month,
      emi: Math.round((interestPaid + principalPaid) * 100) / 100,
      principal: principalPaid,
      interest: interestPaid,
      prepayment: cappedPrepayment,
      balance: newBalance < 0.01 ? 0 : newBalance,
    });

    balance = newBalance;
    month++;
  }

  const baseSchedule = buildBaseSchedule(P, r, n, emi);
  const baseTotalInterest = baseSchedule.reduce((sum, row) => sum + row.interest, 0);
  const roundedBase = Math.round(baseTotalInterest * 100) / 100;

  const newTenure = schedule.length;
  const interestSaved = Math.round((roundedBase - totalInterestPaid) * 100) / 100;
  const tenureReduced = n - newTenure;

  return {
    schedule,
    interestSaved: Math.max(0, interestSaved),
    tenureReduced: Math.max(0, tenureReduced),
    newTenure,
    newTotalInterest: totalInterestPaid,
  };
}

function buildBaseSchedule(P: number, r: number, n: number, emi: number): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  let balance = P;

  for (let month = 1; month <= n && balance > 0.01; month++) {
    const interestPaid = Math.round(balance * r * 100) / 100;
    let principalPaid = Math.round((emi - interestPaid) * 100) / 100;
    if (principalPaid > balance) principalPaid = balance;
    const newBalance = Math.round((balance - principalPaid) * 100) / 100;

    rows.push({
      month,
      emi: Math.round((interestPaid + principalPaid) * 100) / 100,
      principal: principalPaid,
      interest: interestPaid,
      prepayment: 0,
      balance: newBalance < 0.01 ? 0 : newBalance,
    });

    balance = newBalance;
  }

  return rows;
}

export function findBreakEvenMonth(schedule: AmortizationRow[]): number {
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;

  for (const row of schedule) {
    cumulativePrincipal = Math.round((cumulativePrincipal + row.principal) * 100) / 100;
    cumulativeInterest = Math.round((cumulativeInterest + row.interest) * 100) / 100;
    if (cumulativePrincipal >= cumulativeInterest) return row.month;
  }

  return -1;
}