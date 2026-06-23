"use client";

import { createContext } from "react";
import type { SharedState } from "@/types/state";
import type { AppAction } from "@/types/actions";
import { initialState } from "./initialState";

interface AppContextValue {
  state: SharedState;
  dispatch: React.Dispatch<AppAction>;
  tabId: string;
  activeTabs: number;
  isLeader: boolean;
}

export const AppContext = createContext<AppContextValue>({
  state: initialState,
  dispatch: () => undefined,
  tabId: "",
  activeTabs: 1,
  isLeader: false,
});