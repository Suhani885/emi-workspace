"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { PresenceMap, TabMeta, BroadcastMessage } from "@/types/presence";

const HEARTBEAT_INTERVAL = 3000;
const CLEANUP_INTERVAL = 4000;
const STALE_THRESHOLD = 6000;
const ELECTION_SETTLE_MS = 500;

export function usePresence(
  tabId: string,
  joinedAt: number,
  channelRef: React.RefObject<BroadcastChannel | null>
): TabMeta {
  const [presenceMap, setPresenceMap] = useState<PresenceMap>({});
  const presenceMapRef = useRef<PresenceMap>({});
  const [isSettled, setIsSettled] = useState(false);
  const isSettledRef = useRef(false);

  const updatePresence = useCallback(
    (id: string, lastSeen: number, entryJoinedAt: number) => {
      presenceMapRef.current = {
        ...presenceMapRef.current,
        [id]: { lastSeen, joinedAt: entryJoinedAt },
      };
      setPresenceMap({ ...presenceMapRef.current });
    },
    []
  );

  const removePresence = useCallback((id: string) => {
    const next = { ...presenceMapRef.current };
    delete next[id];
    presenceMapRef.current = next;
    setPresenceMap({ ...next });
  }, []);

  const settle = useCallback(() => {
    if (!isSettledRef.current) {
      isSettledRef.current = true;
      setIsSettled(true);
    }
  }, []);

  const sendHeartbeat = useCallback(() => {
    if (!channelRef.current || !tabId) return;
    const message: BroadcastMessage = { type: "HEARTBEAT", tabId, joinedAt };
    channelRef.current.postMessage(message);
    updatePresence(tabId, Date.now(), joinedAt);
  }, [tabId, joinedAt, channelRef, updatePresence]);

  useEffect(() => {
    if (!tabId || !joinedAt || !channelRef.current) return;

    updatePresence(tabId, Date.now(), joinedAt);

    const settleTimer = setTimeout(settle, ELECTION_SETTLE_MS);

    const handleMessage = (event: MessageEvent<BroadcastMessage>) => {
      const { type, tabId: senderId, joinedAt: senderJoinedAt } = event.data;

      if (!senderId || senderId === tabId) return;

      if (type === "HEARTBEAT") {
        updatePresence(senderId, Date.now(), senderJoinedAt ?? Date.now());
        settle();
      }

      if (type === "TAB_CLOSE") {
        removePresence(senderId);
      }

      if (type === "LEADER_REQUEST") {
        channelRef.current?.postMessage({ type: "HEARTBEAT", tabId, joinedAt });
        if (senderJoinedAt) {
          updatePresence(senderId, Date.now(), senderJoinedAt);
        }
      }
    };

    channelRef.current.addEventListener("message", handleMessage);

    const heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    sendHeartbeat();

    const cleanupTimer = setInterval(() => {
      const now = Date.now();
      const next = { ...presenceMapRef.current };
      let changed = false;

      Object.entries(next).forEach(([id, entry]) => {
        if (id !== tabId && now - entry.lastSeen > STALE_THRESHOLD) {
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
      channelRef.current.postMessage({ type: "TAB_CLOSE", tabId });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearTimeout(settleTimer);
      channelRef.current?.removeEventListener("message", handleMessage);
      clearInterval(heartbeatTimer);
      clearInterval(cleanupTimer);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [tabId, joinedAt, channelRef, sendHeartbeat, updatePresence, removePresence, settle]);

  const activeTabs = Object.keys(presenceMap).length;

  const leaderTabId = Object.entries(presenceMap).reduce<string | null>(
    (acc, [id, entry]) => {
      if (acc === null) return id;
      const accJoinedAt = presenceMap[acc].joinedAt;
      if (entry.joinedAt < accJoinedAt) return id;
      if (entry.joinedAt === accJoinedAt && id < acc) return id;
      return acc;
    },
    null
  );

  const isLeader = isSettled && leaderTabId === tabId;

  return { tabId, activeTabs, isLeader };
}
