import type { ReactNode } from 'react'

interface ArcGaugeProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  tone?: 'accent' | 'danger'
  trackColor?: string
  /** Angular opening at the bottom, in degrees. */
  gapDegrees?: number
  children?: ReactNode
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/** Angle convention: 0deg = right, 90deg = bottom, clockwise as angle increases (SVG y-down). */
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, startAngle)
  const end = polarToCartesian(cx, cy, r, endAngle)
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
}

export function ArcGauge({ value, size = 220, strokeWidth = 18, tone = 'accent', trackColor, gapDegrees = 70, children }: ArcGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const startAngle = 90 + gapDegrees / 2
  const sweep = 360 - gapDegrees
  const endAngle = startAngle + sweep
  const trackPath = describeArc(cx, cy, radius, startAngle, endAngle)
  const pathLength = radius * (sweep * (Math.PI / 180))
  const progressOffset = pathLength * (1 - clamped / 100)
  const color = tone === 'accent' ? 'var(--color-accent-strong)' : 'var(--color-danger-strong)'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <path d={trackPath} fill="none" stroke={trackColor ?? 'var(--color-surface-2)'} strokeWidth={strokeWidth} strokeLinecap="round" />
        <path
          d={trackPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={progressOffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">{children}</div>
    </div>
  )
}
