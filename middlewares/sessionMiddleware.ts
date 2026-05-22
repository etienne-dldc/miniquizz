import { getCookie } from "@hono/hono/cookie";
import { createMiddleware } from "@hono/hono/factory";
import type { Session, Sessions } from "../logic/sessions.ts";

declare module "@hono/hono" {
  interface ContextVariableMap {
    session: Session | null;
  }
}

export function createSessionMiddleware(
  sessionCookieName: string,
  sessions: Sessions,
) {
  return createMiddleware(async (c, next) => {
    const sessionKey = getCookie(c, sessionCookieName);
    const session = sessionKey ? sessions.get(sessionKey) : null;
    c.set("session", session);
    await next();
  });
}
