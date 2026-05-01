/**
 * Next.js Instrumentation — runs once when the server starts.
 * Use this for initializing monitoring, tracing, or logging SDKs.
 * See: https://nextjs.org/docs/app/guides/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Log startup info for deployment verification
    console.log(
      `[Startup] Salon Microsite v${process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0"} starting`,
      {
        env: process.env.NODE_ENV,
        appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "(not set)",
        hasResend: Boolean(process.env.RESEND_API_KEY),
        hasVapid: Boolean(process.env.VAPID_PRIVATE_KEY),
      }
    );

    // Warn about missing optional configuration at startup
    const optionalVars: Record<string, string> = {
      RESEND_API_KEY: "Email notifications will be disabled",
      VAPID_PRIVATE_KEY: "Push notifications will be disabled",
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: "Push notifications will be disabled",
    };

    for (const [key, impact] of Object.entries(optionalVars)) {
      if (!process.env[key]) {
        console.warn(`[Config] ${key} not set — ${impact}`);
      }
    }
  }
}
