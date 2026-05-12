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

export function createSessions(storageKey: string): Sessions {
  const sessions = loadSessions();

  return {
    get(sessionId: string): Session | null {
      return sessions.get(sessionId) ?? null;
    },
    create(name: string, isAdmin: boolean): Session {
      const sessionId = crypto.randomUUID();
      const session: Session = { id: sessionId, name, isAdmin };
      sessions.set(sessionId, session);
      saveSessions(sessions);
      return session;
    },
    delete(sessionId: string): void {
      sessions.delete(sessionId);
      saveSessions(sessions);
    },
  };

  function loadSessions(): Map<string, Session> {
    const sessionsStr = localStorage.getItem(storageKey);
    if (sessionsStr) {
      try {
        const sessionsObj = JSON.parse(sessionsStr);
        return new Map(
          Object.entries(sessionsObj).map((
            [key, value],
          ) => [key, value as Session]),
        );
      } catch (e) {
        console.error("Failed to parse sessions from localStorage", e);
      }
    }
    return new Map();
  }

  function saveSessions(sessions: Map<string, Session>): void {
    const sessionsObj = Object.fromEntries(sessions);
    localStorage.setItem(storageKey, JSON.stringify(sessionsObj));
  }
}
