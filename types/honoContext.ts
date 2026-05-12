import type { Session } from "../logic/sessions.ts";

declare module "hono" {
  interface ContextVariableMap {
    session: Session | null;
  }
}

export {};
