"use client";

import { useEffect, useRef } from "react";
import type { SharedState } from "@/types/state";
import type { AppAction } from "@/types/actions";
import type { BroadcastMessage } from "@/types/presence";

export function useBroadcast(
  state: SharedState,
  dispatch: React.Dispatch<AppAction>,
  tabId: string
) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const isSyncingRef = useRef(false);
  const prevStateRef = useRef<SharedState>(state);

  useEffect(() => {
    channelRef.current = new BroadcastChannel("emi-workspace");
    channelRef.current.postMessage({
      type: "LEADER_REQUEST",
      tabId,
    });

    channelRef.current.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      const { type, tabId: senderId, payload } = event.data;

      if (senderId === tabId) return;

      if (type === "STATE_UPDATE") {
        isSyncingRef.current = true;
        dispatch({ type: "SYNC_STATE", payload: payload as SharedState });
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 50);
      }
    };

    return () => {
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [tabId, dispatch]);

  useEffect(() => {
    if (isSyncingRef.current) return;
    if (prevStateRef.current === state) return;
    prevStateRef.current = state;

    const baseState = {
      loan: state.loan,
      mode: state.mode,
      scenarios: state.scenarios,
      prepayments: state.prepayments,
      theme: state.theme,
    };

    channelRef.current?.postMessage({
      type: "STATE_UPDATE",
      tabId,
      payload: baseState as any,
    });
  }, [state, tabId]);

  return channelRef;
}