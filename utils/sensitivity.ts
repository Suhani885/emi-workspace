import { calculateEMI } from "./emi";

const RATE_MIN = 1;
const RATE_MAX = 36;
const TENURE_MIN = 1;
const TENURE_MAX = 84;

function dedupe(arr: number[]): number[] {
  return [...new Set(arr)];
}

export function buildRateAxis(rate: number): number[] {
  const offsets = [-3, -2, -1, 0, 1, 2, 3];
  const raw = offsets.map((o) => Math.round((rate + o) * 10) / 10);
  const clamped = raw.map((v) => Math.min(RATE_MAX, Math.max(RATE_MIN, v)));
  return dedupe(clamped);
}

export function buildTenureAxis(tenure: number): number[] {
  const offsets = [-24, -12, -6, 0, 6, 12, 24];
  const raw = offsets.map((o) => tenure + o);
  const clamped = raw.map((v) => Math.min(TENURE_MAX, Math.max(TENURE_MIN, v)));
  return dedupe(clamped);
}

export function buildSensitivityGrid(
  P: number,
  rate: number,
  tenure: number
): { rates: number[]; tenures: number[]; grid: number[][] } {
  const rates = buildRateAxis(rate);
  const tenures = buildTenureAxis(tenure);

  const grid = tenures.map((t) =>
    rates.map((r) => calculateEMI(P, r, t))
  );

  return { rates, tenures, grid };
}