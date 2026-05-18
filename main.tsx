import { sValidator } from "@hono/standard-validator";
import * as v from "@valibot/valibot";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { serveStatic } from "hono/deno";
import { streamSSE } from "hono/streaming";
import console from "node:console";
import { AdminQuizz } from "./components/AdminQuizz.tsx";
import { UserQuizz } from "./components/UserQuizz.tsx";
import denoJson from "./deno.json" with { type: "json" };
import { adminActionSchema } from "./logic/adminActionSchema.ts";
import { SESSION_COOKIE_NAME, SESSIONS_STORAGE_KEY, STATE_STORAGE_KEY } from "./logic/constants.ts";
import { appEnv } from "./logic/env.ts";
import { createQuizzStore } from "./logic/quizzStore.ts";
import { createSessions } from "./logic/sessions.ts";
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

console.log(`Starting Miniquizz v${denoJson.version}`);
console.log(
  `OpenTelemetry ${appEnv.otel.denoEnabled ? "enabled" : "disabled"}`,
);

const store = await createQuizzStore(appEnv.dataFolderPath, STATE_STORAGE_KEY);
const sessions = createSessions(SESSIONS_STORAGE_KEY);

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
    root: appEnv.dataFolderPath,
    rewriteRequestPath: (path) => path.replace(/^\/data/, ""),
  }),
);

app.use("*", cacheControlMiddleware);

app.onError((err, c) => {
  console.error(err);
  const message = err instanceof Error ? err.message : "An unexpected error occurred";

  return c.html(
    <ErrorPage
      title="Error"
      message={message}
      returnPath="/"
      returnLabel="Back"
    />,
    500,
  );
});

app.notFound((c) => {
  return c.html(<NotFoundPage />, 404);
});

app.get("/", async (c) => {
  const session = c.get("session");
  if (!session) {
    return await c.html(
      <LoginPage />,
    );
  }

  return await c.html(
    <HomePage session={session} state={store.getState()} />,
  );
});

app.get("/admin", (c) => {
  const session = c.get("session");
  if (!session) {
    return c.html(<AdminLoginPage />);
  }

  if (!session.isAdmin) {
    return c.redirect("/");
  }

  return c.html(<AdminPage state={store.getState()} session={session} />);
});

app.post(
  "/admin",
  sValidator(
    "form",
    v.object({
      password: v.pipe(v.string(), v.nonEmpty("Password cannot be empty")),
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
      return c.html(<AdminLoginPage invalidPassword />, 401);
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
      name: v.pipe(v.string(), v.nonEmpty("Name cannot be empty")),
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
  deleteCookie(c, SESSION_COOKIE_NAME);
  return c.redirect("/");
});

app.get("/stream", (c) => {
  const session = c.get("session");
  if (!session) {
    return c.text("Unauthorized", 401);
  }
  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      data: <UserQuizz sessionId={session.id} state={store.getState()} />,
    });

    let queue = Promise.resolve();
    const unsub = store.subscribe((event) => {
      if (
        event.type === "All" ||
        (event.type === "User" && event.sessionId === session.id)
      ) {
        queue = queue.then(async () => {
          await stream.writeSSE({
            data: <UserQuizz sessionId={session.id} state={store.getState()} />,
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

app.get("/admin/stream", (c) => {
  const session = c.get("session");
  if (!session || !session.isAdmin) {
    return c.text("Unauthorized", 401);
  }
  return streamSSE(c, async (stream) => {
    await stream.writeSSE({ data: <AdminQuizz state={store.getState()} session={session} /> });

    let queue = Promise.resolve();
    const unsub = store.subscribe((event) => {
      if (event.type === "All" || event.type === "Admin" || (event.type === "User" && event.sessionId === session.id)) {
        queue = queue.then(async () => {
          await stream.writeSSE({
            data: <AdminQuizz state={store.getState()} session={session} />,
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
    return c.text("Unauthorized", 401);
  }
  const action = c.req.valid("form");
  store.dispatch({ session, action });
  return c.text("OK");
});

app.post("/admin/action", sValidator("form", adminActionSchema), (c) => {
  const session = c.get("session");
  if (!session || !session.isAdmin) {
    return c.text("Unauthorized", 401);
  }
  const action = c.req.valid("form");
  store.dispatch({ session, action });
  return c.text("OK");
});

console.log(`Miniquizz listening on :${appEnv.port}`);
Deno.serve({ port: appEnv.port }, app.fetch);
