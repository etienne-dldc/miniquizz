import { type Child, createContext, useContext } from "@hono/hono/jsx";
import type { AppProgress } from "../logic/progress.ts";
import type { Session } from "../logic/sessions.ts";
import type { AppStore, CurrentSessionState } from "../logic/store.ts";

export interface SlidesContextValue {
  progress: AppProgress;
  store?: AppStore;
  session?: Session;
  sessionState: CurrentSessionState | null;
}

export const SlidesContext = createContext<SlidesContextValue | null>(null);

export function SlidesProvider({ value, children }: { value: SlidesContextValue; children: Child }) {
  return (
    <SlidesContext.Provider value={value}>
      {children}
    </SlidesContext.Provider>
  );
}

export function useSlides() {
  const store = useContext(SlidesContext);
  if (!store) {
    throw new Error("useSlides must be used within a SlidesProvider");
  }
  return store;
}
