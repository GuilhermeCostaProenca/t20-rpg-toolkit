"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type InspectPayload = {
  title: string;
  subtitle?: string;
  body?: string;
  meta?: Array<{ label: string; value: string }>;
};

type WorldInspectContextValue = {
  payload: InspectPayload | null;
  setPayload: (payload: InspectPayload | null) => void;
};

const WorldInspectContext = createContext<WorldInspectContextValue | null>(null);

export function WorldInspectProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<InspectPayload | null>(null);
  const value = useMemo(() => ({ payload, setPayload }), [payload]);
  return <WorldInspectContext.Provider value={value}>{children}</WorldInspectContext.Provider>;
}

export function useWorldInspect() {
  const context = useContext(WorldInspectContext);
  if (!context) {
    throw new Error("useWorldInspect must be used within WorldInspectProvider");
  }
  return context;
}