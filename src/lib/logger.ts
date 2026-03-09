import "server-only";

type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: typeof error === "string" ? error : "Unknown error",
  };
}

async function sendToMonitoring(level: LogLevel, event: string, context: LogContext) {
  const webhook = process.env.MONITORING_WEBHOOK_URL?.trim();
  if (!webhook || level !== "error") return;

  try {
    await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        level,
        event,
        context,
        service: "pickme",
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Monitoring should never break the main request flow.
  }
}

async function writeLog(level: LogLevel, event: string, context: LogContext = {}) {
  const entry = {
    level,
    event,
    context,
    service: "pickme",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  };

  const output = JSON.stringify(entry);
  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.info(output);
  }

  await sendToMonitoring(level, event, context);
}

export async function logInfo(event: string, context: LogContext = {}) {
  await writeLog("info", event, context);
}

export async function logWarn(event: string, context: LogContext = {}) {
  await writeLog("warn", event, context);
}

export async function logError(event: string, error: unknown, context: LogContext = {}) {
  await writeLog("error", event, {
    ...context,
    error: normalizeError(error),
  });
}

