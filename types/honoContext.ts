import type { Session } from "../logic/sessions.ts";

declare module "@hono/hono" {
  interface ContextVariableMap {
    session: Session | null;
  }
}

export {};
