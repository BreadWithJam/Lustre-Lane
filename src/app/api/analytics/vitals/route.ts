import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRateLimitKey, RateLimits } from "@/lib/rate-limit";

interface VitalsPayload {
  name: "CLS" | "FCP" | "INP" | "LCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
}

/**
 * Receives Core Web Vitals from the WebVitals client component.
 * In production, forward to your analytics provider here (e.g. Datadog, Grafana, etc.).
 * Requirement 6.4 — Core Web Vitals performance standards.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Light rate limiting — vitals are sent per page load, not per user action
  const key = getRateLimitKey(request, "vitals");
  const limit = checkRateLimit(key, RateLimits.api);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let payload: VitalsPayload;
  try {
    payload = (await request.json()) as VitalsPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, value, rating, delta, id, navigationType } = payload;

  // Validate required fields
  if (!name || value === undefined || !rating) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Log in production for observability — replace with your analytics sink
  // e.g. Datadog: datadogRum.addTiming(name, value)
  // e.g. Google Analytics: gtag('event', name, { value, metric_rating: rating })
  console.log(
    `[Vitals] ${name}=${name === "CLS" ? value.toFixed(3) : Math.round(value)}${name === "CLS" ? "" : "ms"} rating=${rating} id=${id} nav=${navigationType} delta=${delta}`
  );

  return NextResponse.json({ ok: true });
}
