'use client'

import { useEffect, useRef } from 'react'

const BUBBLES = [
  { text: '"Can I blend this copper tone with my natural base?"', align: 'end', speed: 0.0012, phase: 0 },
  { text: '"Looking for a low-maintenance cut before summer travel."', align: 'start', speed: 0.0009, phase: 1.8 },
  { text: '"Do you have openings for a treatment + gloss next week?"', align: 'end', speed: 0.0011, phase: 3.4 },
]

export function FloatingBubbles() {
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    let raf: number
    const amplitude = 4 // subtle — only 4px

    function tick(t: number) {
      BUBBLES.forEach((b, i) => {
        const el = refs.current[i]
        if (!el) return
        const y = Math.sin(t * b.speed + b.phase) * amplitude
        el.style.transform = `translateY(${y}px)`
      })
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="flex flex-col gap-8 py-4">
      {BUBBLES.map((b, i) => (
        <div
          key={b.text}
          ref={(el) => { refs.current[i] = el }}
          className={`${b.align === 'end' ? 'self-end' : 'self-start'} max-w-[270px] rounded-2xl px-5 py-4 text-sm italic`}
          style={{
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.22)',
            color: 'rgba(255,255,255,0.88)',
            willChange: 'transform',
          }}
        >
          {b.text}
        </div>
      ))}
    </div>
  )
}
