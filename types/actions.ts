import type { SharedState, Loan, Scenario, Prepayment, Mode, Theme } from "./state";

export const ActionTypes = {
  SET_LOAN: "SET_LOAN",
  SET_MODE: "SET_MODE",
  SET_SCENARIOS: "SET_SCENARIOS",
  ADD_SCENARIO: "ADD_SCENARIO",
  UPDATE_SCENARIO: "UPDATE_SCENARIO",
  REMOVE_SCENARIO: "REMOVE_SCENARIO",
  ADD_PREPAYMENT: "ADD_PREPAYMENT",
  REMOVE_PREPAYMENT: "REMOVE_PREPAYMENT",
  SET_THEME: "SET_THEME",
  SYNC_STATE: "SYNC_STATE",
  UNDO: "UNDO",
} as const;

export type ActionType = (typeof ActionTypes)[keyof typeof ActionTypes];

export type AppAction =
  | { type: "SET_LOAN"; payload: Partial<Loan> }
  | { type: "SET_MODE"; payload: Mode }
  | { type: "SET_SCENARIOS"; payload: Scenario[] }
  | { type: "ADD_SCENARIO"; payload: Scenario }
  | { type: "UPDATE_SCENARIO"; payload: { id: string; updates: Partial<Scenario> } }
  | { type: "REMOVE_SCENARIO"; payload: string }
  | { type: "ADD_PREPAYMENT"; payload: Prepayment }
  | { type: "REMOVE_PREPAYMENT"; payload: string }
  | { type: "SET_THEME"; payload: Theme }
  | { type: "SYNC_STATE"; payload: SharedState }
  | { type: "UNDO" };