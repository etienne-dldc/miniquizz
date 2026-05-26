import { Hono } from "@hono/hono";
import { deleteCookie, setCookie } from "@hono/hono/cookie";
import { serveStatic } from "@hono/hono/deno";
import { streamSSE } from "@hono/hono/streaming";
import { sValidator } from "@hono/standard-validator";
import { resolve } from "@std/path";
import * as v from "@valibot/valibot";
import console from "node:console";
import { AdminLiveQuizz } from "./components/AdminLiveQuizz.tsx";
import { Status } from "./components/Status.tsx";
import { UserLiveQuizz } from "./components/UserLiveQuizz.tsx";
import denoJson from "./deno.json" with { type: "json" };
import { adminActionSchema } from "./logic/adminActionSchema.ts";
import { SESSION_COOKIE_NAME, SESSIONS_STORAGE_KEY, STATE_STORAGE_KEY } from "./logic/constants.ts";
import { appEnv } from "./logic/env.ts";
import { createFileStorage } from "./logic/fileStorage.ts";
import { createSessions } from "./logic/sessions.ts";
import { createAppStore } from "./logic/store.ts";
import { userActionSchema } from "./logic/userActionSchema.ts";
import { cacheControlMiddleware } from "./middlewares/cacheControlMiddleware.ts";
import { otelRouteMiddleware } from "./middlewares/otelRouteMiddleware.ts";
import { createSessionMiddleware } from "./middlewares/sessionMiddleware.ts";
import "./types/honoContext.ts";
import { AdminLoginPage } from "./views/AdminLoginPage.tsx";
import { AdminPage } from "./views/AdminPage.tsx";
import { ErrorPage } from "./views/ErrorPage.tsx";
import { HomePage } from "./views/HomePage.tsx";
import { LoginPage } from "./views/LoginPage.tsx";
import { NotFoundPage } from "./views/NotFoundPage.tsx";

console.info(`Starting Miniquizz v${denoJson.version}`);
console.info(
  `OpenTelemetry ${appEnv.otel.denoEnabled ? "enabled" : "disabled"}`,
);

const storage = createFileStorage(appEnv.storageFolderPath);
const sessions = createSessions(storage, SESSIONS_STORAGE_KEY);
const store = await createAppStore(storage, appEnv.dataFolderPath, STATE_STORAGE_KEY, sessions);

const app = new Hono();

app.use("*", otelRouteMiddleware);
app.use("*", createSessionMiddleware(SESSION_COOKIE_NAME, sessions));

app.use(
  "/public/*",
  serveStatic({ root: "./" }),
);

app.use(
  "/data/*",
  serveStatic({
    root: resolve(appEnv.dataFolderPath, "public"),
    rewriteRequestPath: (path) => path.replace(/^\/data/, ""),
  }),
);

app.use("*", cacheControlMiddleware);

app.onError((err, c) => {
  console.error(err);
  const message = err instanceof Error ? err.message : "Une erreur inattendue est survenue";
  const session = c.get("session");

  return c.html(
    <ErrorPage
      title="Erreur"
      message={message}
      returnPath="/"
      returnLabel="Retour"
      session={session}
    />,
    500,
  );
});

app.notFound((c) => {
  const session = c.get("session");
  return c.html(<NotFoundPage session={session} />, 404);
});

app.get("/", async (c) => {
  const session = c.get("session");
  if (!session) {
    return await c.html(
      <LoginPage title={store.getDoc().name} />,
    );
  }

  return await c.html(
    <HomePage session={session} store={store} />,
  );
});

app.get("/admin", (c) => {
  const session = c.get("session");
  if (!session) {
    return c.html(<AdminLoginPage title={store.getDoc().name} />);
  }

  if (!session.isAdmin) {
    return c.redirect("/");
  }

  return c.html(<AdminPage store={store} session={session} />);
});

app.post(
  "/admin",
  sValidator(
    "form",
    v.object({
      password: v.pipe(v.string(), v.nonEmpty("Le mot de passe ne peut pas etre vide")),
    }),
  ),
  (c) => {
    const session = c.get("session");
    if (session) {
      if (session.isAdmin) {
        return c.redirect("/admin");
      }
      return c.redirect("/");
    }

    const { password } = c.req.valid("form");
    if (password !== appEnv.adminPassword) {
      return c.html(<AdminLoginPage invalidPassword title={store.getState().doc.name} />, 401);
    }

    const adminSession = sessions.create("Admin", true);
    setCookie(c, SESSION_COOKIE_NAME, adminSession.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });

    return c.redirect("/admin");
  },
);

app.post(
  "/login",
  sValidator(
    "form",
    v.object({
      name: v.pipe(v.string(), v.nonEmpty("Le nom ne peut pas etre vide")),
    }),
  ),
  (c) => {
    const { name } = c.req.valid("form");
    const session = sessions.create(name, false);
    setCookie(c, SESSION_COOKIE_NAME, session.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });
    return c.redirect("/");
  },
);

app.post("/logout", (c) => {
  const session = c.get("session");
  if (session) {
    sessions.delete(session.id);
  }
  const isHtmx = c.req.header("HX-Request") === "true";
  if (isHtmx) {
    return c.text("Deconnexion effectuee", 200, {
      "HX-Redirect": "/",
    });
  }

  deleteCookie(c, SESSION_COOKIE_NAME);
  return c.redirect("/");
});

app.get("/stream", (c) => {
  const session = c.get("session");
  if (!session) {
    return c.text("Non autorise", 401);
  }
  return streamSSE(c, async (stream) => {
    store.dispatch({ session, action: { type: "Join" } });
    await stream.writeSSE({
      data: <UserLiveQuizz session={session} store={store} />,
    });

    let queue = Promise.resolve();
    const unsub = store.subscribe((event) => {
      const isUserAudience = event.audience.type === "All" || (event.audience.type === "User" && event.audience.sessionId === session.id);
      if (event.topic === "Quizz" && isUserAudience) {
        queue = queue.then(async () => {
          await stream.writeSSE({
            data: <UserLiveQuizz session={session} store={store} />,
          });
        });
      }
    });

    await new Promise<void>((resolve) => {
      stream.onAbort(() => {
        unsub();
        resolve();
      });
    });
  });
});

app.get("/admin/stream/quizz", (c) => {
  const session = c.get("session");
  if (!session || !session.isAdmin) {
    return c.text("Non autorise", 401);
  }
  return streamSSE(c, async (stream) => {
    await stream.writeSSE({ data: <AdminLiveQuizz store={store} session={session} /> });

    let queue = Promise.resolve();
    const unsub = store.subscribe((event) => {
      const isAdminAudience = event.audience.type === "All" || event.audience.type === "Admin" ||
        (event.audience.type === "User" && event.audience.sessionId === session.id);
      if (event.topic === "Quizz" && isAdminAudience) {
        queue = queue.then(async () => {
          await stream.writeSSE({
            data: <AdminLiveQuizz store={store} session={session} />,
          });
        });
      }
    });

    await new Promise<void>((resolve) => {
      stream.onAbort(() => {
        unsub();
        resolve();
      });
    });
  });
});

app.get("/admin/stream/status", (c) => {
  const session = c.get("session");
  if (!session || !session.isAdmin) {
    return c.text("Non autorise", 401);
  }
  return streamSSE(c, async (stream) => {
    await stream.writeSSE({ data: <Status store={store} /> });

    let queue = Promise.resolve();
    const unsub = store.subscribe((event) => {
      const isAdminAudience = event.audience.type === "All" || event.audience.type === "Admin";
      if (event.topic === "Status" && isAdminAudience) {
        queue = queue.then(async () => {
          await stream.writeSSE({
            data: <Status store={store} />,
          });
        });
      }
    });

    await new Promise<void>((resolve) => {
      stream.onAbort(() => {
        unsub();
        resolve();
      });
    });
  });
});

app.post("/action", sValidator("form", userActionSchema), (c) => {
  const session = c.get("session");
  if (!session) {
    return c.text("Non autorise", 401);
  }
  const action = c.req.valid("form");
  store.dispatch({ session, action });
  return c.text("OK");
});

app.post("/admin/action", sValidator("form", adminActionSchema), (c) => {
  const session = c.get("session");
  if (!session || !session.isAdmin) {
    return c.text("Non autorise", 401);
  }
  const action = c.req.valid("form");
  store.dispatch({ session, action });
  return c.text("OK");
});

const abortController = new AbortController();
const server = Deno.serve({
  port: appEnv.port,
  signal: abortController.signal,
  onListen: () => {
    console.info(`Server is listening on port ${appEnv.port}`);
  },
}, app.fetch);

let shuttingDown = false;
const shutdown = async (signal: "SIGINT" | "SIGTERM") => {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  console.info(`Received ${signal}, shutting down`);
  abortController.abort();
  await store.dispose();
};

Deno.addSignalListener("SIGINT", () => {
  void shutdown("SIGINT");
});

Deno.addSignalListener("SIGTERM", () => {
  void shutdown("SIGTERM");
});

await server.finished;
