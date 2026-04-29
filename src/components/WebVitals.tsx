'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import type { Metric } from 'web-vitals'

/**
 * Reports Core Web Vitals to the console in development and to an analytics
 * endpoint in production. Requirement 6.4 — Core Web Vitals performance standards.
 */
function sendToAnalytics(metric: Metric) {
  if (process.env.NODE_ENV === 'development') {
    // Log to console in development for easy inspection
    const color = metric.rating === 'good' ? '🟢' : metric.rating === 'needs-improvement' ? '🟡' : '🔴'
    // CLS is a unitless score; other metrics are in milliseconds
    const unit = metric.name === 'CLS' ? '' : 'ms'
    const value = metric.name === 'CLS' ? metric.value.toFixed(3) : Math.round(metric.value)
    console.log(`${color} [Web Vitals] ${metric.name}: ${value}${unit} (${metric.rating})`)
    return
  }

  // In production, send to your analytics endpoint
  // Replace with your actual analytics service (e.g. Google Analytics, Datadog, etc.)
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  })

  // Use sendBeacon for reliability during page unload
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body)
  } else {
    fetch('/api/analytics/vitals', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {
      // Silently fail — vitals reporting is non-critical
    })
  }
}

export function WebVitals() {
  useEffect(() => {
    onCLS(sendToAnalytics)
    onFCP(sendToAnalytics)
    onINP(sendToAnalytics)
    onLCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
  }, [])

  // This component renders nothing — it only registers metric observers
  return null
}
