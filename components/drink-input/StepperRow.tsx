'use client'

import { DRINKS, INPUT_MAX } from '@/lib/constants'

interface StepperRowProps {
  type: 'soju' | 'beer'
  value: number
  onChange: (newValue: number) => void
}

const LABELS: Record<'soju' | 'beer', string> = { soju: '소주', beer: '맥주' }

function mlHint(type: 'soju' | 'beer', value: number): string {
  const ml = DRINKS[type].mlPerUnit * value
  return value === 0 ? `${DRINKS[type].mlPerUnit}ml / 1${DRINKS[type].unitLabel}` : `${ml}ml`
}

export function StepperRow({ type, value, onChange }: StepperRowProps) {
  const decrement = () => onChange(Math.max(0, value - 1))
  const increment = () => onChange(Math.min(INPUT_MAX[type], value + 1))

  const btnBase =
    'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-light select-none transition-colors duration-150 active:scale-95'

  return (
    <div className="flex items-center justify-between gap-4">
      {/* 라벨 영역 */}
      <div className="flex-1 min-w-0">
        <p className="text-[0.9375rem] font-semibold" style={{ color: 'var(--color-ink)' }}>
          {LABELS[type]}
          <span
            className="text-[0.75rem] font-normal ml-1"
            style={{ color: 'var(--color-muted)' }}
          >
            / {DRINKS[type].unitLabel}
          </span>
        </p>
        <p className="text-[0.75rem] mt-0.5" style={{ color: 'var(--color-muted)' }}>
          {mlHint(type, value)}
        </p>
      </div>

      {/* 스테퍼 영역 */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          aria-label={`${LABELS[type]} 줄이기`}
          onClick={decrement}
          disabled={value === 0}
          className={btnBase}
          style={{
            border: '1px solid var(--color-glass-stroke)',
            color: 'var(--color-ink)',
          }}
        >
          −
        </button>

        <span
          className="w-16 text-center tabular-nums"
          style={{
            fontSize: 'var(--text-display)',
            fontFeatureSettings: '"tnum"',
            lineHeight: 1,
            color: 'var(--color-ink)',
          }}
        >
          {value}
        </span>

        <button
          type="button"
          aria-label={`${LABELS[type]} 늘리기`}
          onClick={increment}
          disabled={value === INPUT_MAX[type]}
          className={btnBase}
          style={{
            border: '1px solid var(--color-glass-stroke)',
            color: 'var(--color-ink)',
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}
