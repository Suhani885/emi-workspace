export interface Loan {
  amount: number;
  rate: number;
  tenure: number;
}

export interface Scenario {
  id: string;
  name: string;
  amount: number;
  rate: number;
  tenure: number;
}

export interface Prepayment {
  id: string;
  month: number;
  amount: number;
}

export type Mode = "single" | "compare" | "prepayment";
export type Theme = "light" | "dark";

export interface BaseState {
  loan: Loan;
  mode: Mode;
  scenarios: Scenario[];
  prepayments: Prepayment[];
  theme: Theme;
}

export interface SharedState extends BaseState {
  past: BaseState[];
  lastActionTime: number;
}

export interface AmortizationRow {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  prepayment: number;
  balance: number;
}

export interface EMIResult {
  emi: number;
  totalInterest: number;
  totalPayable: number;
  principalPercent: number;
  interestPercent: number;
}

export interface PrepaymentResult {
  schedule: AmortizationRow[];
  interestSaved: number;
  tenureReduced: number;
  newTenure: number;
  newTotalInterest: number;
}