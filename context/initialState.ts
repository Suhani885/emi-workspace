import type { SharedState } from "@/types/state";

export const initialState: SharedState = {
  loan: {
    amount: 1500000,
    rate: 11,
    tenure: 48,
  },
  mode: "single",
  scenarios: [
    {
      id: "scenario-1",
      name: "Conservative",
      amount: 1500000,
      rate: 10.5,
      tenure: 60,
    },
    {
      id: "scenario-2",
      name: "Aggressive",
      amount: 1500000,
      rate: 12,
      tenure: 24,
    },
  ],
  prepayments: [],
  theme: "dark",
  past: [],
  lastActionTime: 0,
};