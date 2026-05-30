import { type Child, createContext, useContext } from "@hono/hono/jsx";
import type { AppStore } from "../logic/store.ts";

export const StoreContext = createContext<AppStore | null>(null);

export function StoreProvider({ store, children }: { store: AppStore; children: Child }) {
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
}

export function useMaybeStore() {
  return useContext(StoreContext);
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return store;
}
