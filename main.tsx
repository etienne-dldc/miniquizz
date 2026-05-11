import { SpanStatusCode, trace } from "@opentelemetry/api";
import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { routePath } from "hono/route";
import console from "node:console";
import denoJson from "./deno.json" with { type: "json" };
import { appEnv } from "./logic/env.ts";
import { ErrorPage } from "./views/ErrorPage.tsx";
import { HomePage } from "./views/HomePage.tsx";
import { NotFoundPage } from "./views/NotFoundPage.tsx";

console.log(`Starting Miniquizz v${denoJson.version}`);
console.log(
  `OpenTelemetry ${appEnv.otel.denoEnabled ? "enabled" : "disabled"}`,
);

const app = new Hono();

app.use("*", async (c, next) => {
  try {
    await next();
  } catch (error) {
    throw error;
  } finally {
    const activeSpan = trace.getActiveSpan();
    if (activeSpan) {
      const route = routePath(c);
      activeSpan.setAttribute("http.route", route);
      activeSpan.updateName(`${c.req.method} ${route}`);

      if (c.error) {
        activeSpan.recordException(c.error);
        activeSpan.setStatus({
          code: SpanStatusCode.ERROR,
          message: c.error.message,
        });
      }
    }
  }
});

app.use(
  "/public/*",
  serveStatic({ root: "./" }),
);

app.use("*", async (c, next) => {
  await next();

  if (!c.req.path.startsWith("/public/")) {
    c.header("cache-control", "no-store");
  }
});

app.onError((err, c) => {
  console.error(err);
  const message = err instanceof Error
    ? err.message
    : "An unexpected error occurred";

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
  return await c.html(
    <HomePage />,
  );
});

console.log(`Miniquizz listening on :${appEnv.port}`);
Deno.serve({ port: appEnv.port }, app.fetch);
