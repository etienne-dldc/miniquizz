import { createMiddleware } from "@hono/hono/factory";

export const cacheControlMiddleware = createMiddleware(async (c, next) => {
  await next();

  if (!c.req.path.startsWith("/public/")) {
    c.header("cache-control", "no-store");
  }
});
