"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { PresenceMap, TabMeta, BroadcastMessage } from "@/types/presence";

const HEARTBEAT_INTERVAL = 3000;
const CLEANUP_INTERVAL = 4000;
const STALE_THRESHOLD = 6000;

export function usePresence(
  tabId: string,
  channelRef: React.RefObject<BroadcastChannel | null>
): TabMeta {
  const [presenceMap, setPresenceMap] = useState<PresenceMap>({});
  const presenceMapRef = useRef<PresenceMap>({});

  const updatePresence = useCallback((id: string, timestamp: number) => {
    presenceMapRef.current = { ...presenceMapRef.current, [id]: timestamp };
    setPresenceMap({ ...presenceMapRef.current });
  }, []);

  const removePresence = useCallback((id: string) => {
    const next = { ...presenceMapRef.current };
    delete next[id];
    presenceMapRef.current = next;
    setPresenceMap({ ...next });
  }, []);

  const sendHeartbeat = useCallback(() => {
    if (!channelRef.current || !tabId) return;
    const message: BroadcastMessage = {
      type: "HEARTBEAT",
      tabId,
    };
    channelRef.current.postMessage(message);
    updatePresence(tabId, Date.now());
  }, [tabId, channelRef, updatePresence]);

  useEffect(() => {
    if (!tabId || !channelRef.current) return;

    updatePresence(tabId, Date.now());

    const handleMessage = (event: MessageEvent<BroadcastMessage>) => {
      const { type, tabId: senderId } = event.data;

      if (type === "HEARTBEAT") {
        updatePresence(senderId, Date.now());
      }

      if (type === "TAB_CLOSE") {
        removePresence(senderId);
      }
    };

    channelRef.current.addEventListener("message", handleMessage);

    const heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    const cleanupTimer = setInterval(() => {
      const now = Date.now();
      const next = { ...presenceMapRef.current };
      let changed = false;

      Object.entries(next).forEach(([id, lastSeen]) => {
        if (id !== tabId && now - lastSeen > STALE_THRESHOLD) {
          delete next[id];
          changed = true;
        }
      });

      if (changed) {
        presenceMapRef.current = next;
        setPresenceMap({ ...next });
      }
    }, CLEANUP_INTERVAL);

    const handleBeforeUnload = () => {
      if (!channelRef.current) return;
      const message: BroadcastMessage = {
        type: "TAB_CLOSE",
        tabId,
      };
      channelRef.current.postMessage(message);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      channelRef.current?.removeEventListener("message", handleMessage);
      clearInterval(heartbeatTimer);
      clearInterval(cleanupTimer);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [tabId, channelRef, sendHeartbeat, updatePresence, removePresence]);

  const activeTabs = Object.keys(presenceMap).length;
  const sortedIds = Object.keys(presenceMap).sort();
  const isLeader = sortedIds[0] === tabId;

  return { tabId, activeTabs, isLeader };
}