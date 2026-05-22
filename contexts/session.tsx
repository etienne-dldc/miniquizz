import { type Child, createContext, useContext } from "@hono/hono/jsx";
import type { Session } from "../logic/sessions.ts";

export const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ session, children }: { session: Session; children: Child }) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return session;
}
