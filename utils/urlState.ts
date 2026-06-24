import type { Loan } from "@/types/state";

const AMOUNT_MIN = 10_000;
const AMOUNT_MAX = 5_000_000;
const RATE_MIN = 1;
const RATE_MAX = 36;
const TENURE_MIN = 1;
const TENURE_MAX = 84;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function safeNum(raw: string | null, fallback: number): number {
  if (raw === null) return fallback;
  const n = Number(raw);
  return isFinite(n) ? n : fallback;
}

export function encodeLoanToParams(loan: Loan): URLSearchParams {
  const p = new URLSearchParams();
  p.set("amount", String(loan.amount));
  p.set("rate", String(loan.rate));
  p.set("tenure", String(loan.tenure));
  return p;
}

export function decodeParamsToLoan(
  params: URLSearchParams,
  fallback: Loan
): Loan {
  const amount = clamp(
    safeNum(params.get("amount"), fallback.amount),
    AMOUNT_MIN,
    AMOUNT_MAX
  );
  const rate = clamp(
    Math.round(safeNum(params.get("rate"), fallback.rate) * 10) / 10,
    RATE_MIN,
    RATE_MAX
  );
  const tenure = clamp(
    Math.round(safeNum(params.get("tenure"), fallback.tenure)),
    TENURE_MIN,
    TENURE_MAX
  );
  return { amount, rate, tenure };
}

export function hasUrlState(params: URLSearchParams): boolean {
  return params.has("amount") || params.has("rate") || params.has("tenure");
}

export function buildShareUrl(loan: Loan): string {
  if (typeof window === "undefined") return "";
  const params = encodeLoanToParams(loan);
  const url = new URL(window.location.href);
  url.search = params.toString();
  return url.toString();
}
