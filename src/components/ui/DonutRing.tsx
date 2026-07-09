import type { ReactNode } from 'react'

interface DonutRingProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  tone?: 'accent' | 'danger'
  trackColor?: string
  children?: ReactNode
}

export function DonutRing({ value, size = 140, strokeWidth = 14, tone = 'accent', trackColor, children }: DonutRingProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped / 100)
  const color = tone === 'accent' ? 'var(--color-accent-strong)' : 'var(--color-danger-strong)'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor ?? 'var(--color-surface-2)'}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
