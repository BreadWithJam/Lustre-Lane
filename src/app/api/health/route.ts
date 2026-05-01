import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/database-health";

export const dynamic = "force-dynamic";

interface HealthStatus {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: "ok" | "error";
      latency?: number;
      error?: string;
    };
    environment: {
      status: "ok" | "error";
      missing?: string[];
    };
  };
}

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_APP_URL",
  // Firebase or Supabase — at least one DB config must be present
];

const OPTIONAL_ENV_VARS_FOR_FEATURES = [
  "RESEND_API_KEY",
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
];

const startTime = Date.now();

/**
 * Health check endpoint for uptime monitoring and deployment verification.
 * Returns 200 when healthy, 503 when degraded or errored.
 * Pinged by Vercel cron every 5 minutes (see vercel.json).
 */
export async function GET(): Promise<NextResponse<HealthStatus>> {
  const dbHealth = await checkDatabaseHealth();

  const missingEnv = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  const missingOptional = OPTIONAL_ENV_VARS_FOR_FEATURES.filter(
    (key) => !process.env[key]
  );

  if (missingOptional.length > 0) {
    console.warn(
      `[Health] Optional env vars not configured: ${missingOptional.join(", ")}`
    );
  }

  const envStatus = missingEnv.length === 0 ? "ok" : "error";

  const overallStatus: HealthStatus["status"] =
    envStatus === "error"
      ? "error"
      : !dbHealth.isHealthy
        ? "degraded"
        : "ok";

  const body: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks: {
      database: {
        status: dbHealth.isHealthy ? "ok" : "error",
        latency: dbHealth.latency,
        error: dbHealth.error,
      },
      environment: {
        status: envStatus,
        missing: missingEnv.length > 0 ? missingEnv : undefined,
      },
    },
  };

  const httpStatus = overallStatus === "ok" ? 200 : 503;
  return NextResponse.json(body, { status: httpStatus });
}
