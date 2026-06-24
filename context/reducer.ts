import type { SharedState, BaseState } from "@/types/state";
import type { AppAction } from "@/types/actions";
import { initialState } from "./initialState";

export function reducer(state: SharedState = initialState, action: AppAction): SharedState {
  if (action.type === "SYNC_STATE") {
    return {
      ...state,
      ...action.payload,
    };
  }

  if (action.type === "UNDO") {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    return {
      ...state,
      ...previous,
      past: state.past.slice(0, -1),
      lastActionTime: 0,
    };
  }

  let nextBase: BaseState = {
    loan: state.loan,
    mode: state.mode,
    scenarios: state.scenarios,
    prepayments: state.prepayments,
    theme: state.theme,
  };

  switch (action.type) {
    case "SET_LOAN": {
      const updatedLoan = { ...state.loan, ...action.payload };
      nextBase.loan = updatedLoan;
      const primaryIdx = state.scenarios.findIndex((s) => s.id === "scenario-primary");
      if (primaryIdx >= 0) {
        nextBase.scenarios = state.scenarios.map((s) =>
          s.id === "scenario-primary"
            ? { ...s, amount: updatedLoan.amount, rate: updatedLoan.rate, tenure: updatedLoan.tenure }
            : s
        );
      } else if (state.scenarios.length < 3) {
        nextBase.scenarios = [
          ...state.scenarios,
          {
            id: "scenario-primary",
            name: "My Loan",
            amount: updatedLoan.amount,
            rate: updatedLoan.rate,
            tenure: updatedLoan.tenure,
          },
        ];
      }
      break;
    }

    case "SET_MODE":
      nextBase.mode = action.payload;
      break;

    case "SET_SCENARIOS":
      nextBase.scenarios = action.payload;
      break;

    case "ADD_SCENARIO":
      if (state.scenarios.length < 3) {
        nextBase.scenarios = [...state.scenarios, action.payload];
      }
      break;

    case "UPDATE_SCENARIO":
      nextBase.scenarios = state.scenarios.map((s) =>
        s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
      );
      break;

    case "REMOVE_SCENARIO":
      nextBase.scenarios = state.scenarios.filter((s) => s.id !== action.payload);
      break;

    case "ADD_PREPAYMENT":
      nextBase.prepayments = [...state.prepayments, action.payload];
      break;

    case "UPDATE_PREPAYMENT":
      nextBase.prepayments = state.prepayments.map((p) =>
        p.id === action.payload.id ? action.payload : p
      );
      break;

    case "REMOVE_PREPAYMENT":
      nextBase.prepayments = state.prepayments.filter((p) => p.id !== action.payload);
      break;

    case "SET_THEME":
      nextBase.theme = action.payload;
      break;

    default:
      return state;
  }

  const now = Date.now();
  const TIME_THRESHOLD = 800;
  
  let newPast = [...(state.past || [])];
  
  if (now - (state.lastActionTime || 0) > TIME_THRESHOLD) {
    const currentBase: BaseState = {
      loan: state.loan,
      mode: state.mode,
      scenarios: state.scenarios,
      prepayments: state.prepayments,
      theme: state.theme,
    };
    newPast.push(currentBase);
    if (newPast.length > 30) newPast.shift();
  }

  return {
    ...nextBase,
    past: newPast,
    lastActionTime: now,
  };
}