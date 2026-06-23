"use client";

import { useReducer, useMemo, useEffect } from "react";
import { AppContext } from "./AppContext";
import { reducer } from "./reducer";
import { initialState } from "./initialState";
import { useTabId } from "@/hooks/useTabId";
import { useBroadcast } from "@/hooks/useBroadcast";
import { usePresence } from "@/hooks/usePresence";
import ThemeApplier from "@/components/layout/ThemeApplier";

interface AppProviderProps {
  children: React.ReactNode;
  initialTheme?: "light" | "dark";
}

export function AppProvider({ children, initialTheme }: AppProviderProps) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    theme: initialTheme ?? initialState.theme,
  });

  const tabId = useTabId();
  const channelRef = useBroadcast(state, dispatch, tabId);
  const { activeTabs, isLeader } = usePresence(tabId, channelRef);

  useEffect(() => {
    if (!channelRef.current || !isLeader) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "LEADER_REQUEST" && event.data.tabId !== tabId) {
        channelRef.current?.postMessage({
          type: "STATE_UPDATE",
          tabId,
          payload: state,
        });
      }
    };

    channelRef.current.addEventListener("message", handleMessage);
    return () => {
      channelRef.current?.removeEventListener("message", handleMessage);
    };
  }, [isLeader, state, tabId, channelRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "UNDO" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const value = useMemo(
    () => ({ state, dispatch, tabId, activeTabs, isLeader }),
    [state, tabId, activeTabs, isLeader]
  );

  return (
    <AppContext.Provider value={value}>
      <ThemeApplier />
      {children}
    </AppContext.Provider>
  );
}