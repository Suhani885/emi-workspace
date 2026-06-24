export interface PresenceEntry {
  lastSeen: number;
  joinedAt: number;
}

export interface PresenceMap {
  [tabId: string]: PresenceEntry;
}

export interface TabMeta {
  tabId: string;
  activeTabs: number;
  isLeader: boolean;
}

export type BroadcastMessageType =
  | "STATE_UPDATE"
  | "HEARTBEAT"
  | "TAB_CLOSE"
  | "LEADER_REQUEST"
  | "LEADER_RESPONSE";

export interface BroadcastMessage {
  type: BroadcastMessageType;
  tabId: string;
  payload?: unknown;
  joinedAt?: number;
}
