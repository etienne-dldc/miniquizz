import { SpanStatusCode, trace } from "@opentelemetry/api";
import { createMiddleware } from "hono/factory";
import { routePath } from "hono/route";

export const otelRouteMiddleware = createMiddleware(async (c, next) => {
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
