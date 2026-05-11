export const DEFAULT_PORT = 3008;

export type AppEnv = {
  port: number;
  otel: {
    denoEnabled: boolean;
    denoConsole: string | null;
    exporterOtlpEndpoint: string | null;
    exporterOtlpProtocol: string | null;
    exporterOtlpHeaders: string | null;
    serviceName: string | null;
    resourceAttributes: string | null;
  };
};

function parseFlag(raw: string | undefined): boolean {
  if (!raw) {
    return false;
  }

  const normalized = raw.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" ||
    normalized === "on";
}

function parsePort(raw: string | undefined): number {
  if (!raw) {
    return DEFAULT_PORT;
  }

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    console.error(
      `[env] Invalid PORT=${
        JSON.stringify(raw)
      }, using default ${DEFAULT_PORT}`,
    );
    return DEFAULT_PORT;
  }

  return parsed;
}

function nullable(raw: string | undefined): string | null {
  const trimmed = raw?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export function readEnv(): AppEnv {
  return {
    port: parsePort(Deno.env.get("PORT")),
    otel: {
      denoEnabled: parseFlag(Deno.env.get("OTEL_DENO")),
      denoConsole: nullable(Deno.env.get("OTEL_DENO_CONSOLE")),
      exporterOtlpEndpoint: nullable(
        Deno.env.get("OTEL_EXPORTER_OTLP_ENDPOINT"),
      ),
      exporterOtlpProtocol: nullable(
        Deno.env.get("OTEL_EXPORTER_OTLP_PROTOCOL"),
      ),
      exporterOtlpHeaders: nullable(Deno.env.get("OTEL_EXPORTER_OTLP_HEADERS")),
      serviceName: nullable(Deno.env.get("OTEL_SERVICE_NAME")),
      resourceAttributes: nullable(Deno.env.get("OTEL_RESOURCE_ATTRIBUTES")),
    },
  };
}

export const appEnv = readEnv();
