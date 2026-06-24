"use client";

import { useEffect, useRef, useCallback } from "react";
import type { SharedState } from "@/types/state";
import type { AppAction } from "@/types/actions";
import {
  encodeLoanToParams,
  decodeParamsToLoan,
  hasUrlState,
} from "@/utils/urlState";
import { initialState } from "@/context/initialState";

const DEBOUNCE_MS = 400;

export function useUrlState(
  state: SharedState,
  dispatch: React.Dispatch<AppAction>
): void {
  const isFirstMount = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastWrittenRef = useRef<string>("");

  useEffect(() => {
    if (!isFirstMount.current) return;
    isFirstMount.current = false;

    const params = new URLSearchParams(window.location.search);
    if (!hasUrlState(params)) return;

    const decoded = decodeParamsToLoan(params, initialState.loan);

    const changed =
      decoded.amount !== state.loan.amount ||
      decoded.rate !== state.loan.rate ||
      decoded.tenure !== state.loan.tenure;

    if (changed) {
      dispatch({
        type: "SET_LOAN",
        payload: decoded,
      });
    }
  }, []);

  useEffect(() => {
    if (isFirstMount.current) return;

    const params = encodeLoanToParams(state.loan);
    const serialized = params.toString();

    if (serialized === lastWrittenRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const url = new URL(window.location.href);
      url.search = serialized;
      window.history.replaceState(null, "", url.toString());
      lastWrittenRef.current = serialized;
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.loan]);

  const handlePopState = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    if (!hasUrlState(params)) return;

    const decoded = decodeParamsToLoan(params, initialState.loan);
    dispatch({ type: "SET_LOAN", payload: decoded });
    lastWrittenRef.current = params.toString();
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [handlePopState]);
}
