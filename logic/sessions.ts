export interface Session {
  id: string;
  name: string;
  isAdmin: boolean;
}

export interface Sessions {
  get(sessionId: string): Session | null;
  create(name: string, isAdmin: boolean): Session;
  delete(sessionId: string): void;
}

export function createSessions() {
  const sessions = new Map<string, Session>();

  return {
    get(sessionId: string): Session | null {
      return sessions.get(sessionId) ?? null;
    },
    create(name: string, isAdmin: boolean): Session {
      const sessionId = crypto.randomUUID();
      const session: Session = { id: sessionId, name, isAdmin };
      sessions.set(sessionId, session);
      return session;
    },
    delete(sessionId: string): void {
      sessions.delete(sessionId);
    },
  };
}
