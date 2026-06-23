export function calculateEMI(P: number, annualRate: number, n: number): number {
  if (P <= 0 || n <= 0) return 0;
  if (annualRate <= 0) return Math.round((P / n) * 100) / 100;

  const r = annualRate / 12 / 100;
  const onePlusRPowN = Math.pow(1 + r, n);
  const emi = (P * r * onePlusRPowN) / (onePlusRPowN - 1);

  return Math.round(emi * 100) / 100;
}

export function calculateTotals(emi: number, P: number, n: number) {
  if (emi <= 0 || P <= 0 || n <= 0) {
    return { totalPayable: 0, totalInterest: 0, principalPercent: 0, interestPercent: 0 };
  }

  const totalPayable = Math.round(emi * n * 100) / 100;
  const totalInterest = Math.round((totalPayable - P) * 100) / 100;
  const principalPercent = Math.round((P / totalPayable) * 10000) / 100;
  const interestPercent = Math.round(100 * 100 - principalPercent * 100) / 100;

  return { totalPayable, totalInterest, principalPercent, interestPercent };
}