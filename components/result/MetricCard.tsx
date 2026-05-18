interface MetricCardProps {
  label: string
  value: string
  unit?: string
  hint?: string
  drivingNote?: boolean
  onInfoClick?: () => void
}

export function MetricCard({
  label,
  value,
  unit,
  hint,
  drivingNote,
  onInfoClick,
}: MetricCardProps) {
  return (
    <div
      className="rounded-[20px] px-6 py-5"
      style={{
        background: 'var(--color-surface)',
        boxShadow: '0 8px 32px rgba(11,20,17,0.06)',
      }}
    >
      <p
        className="text-[0.75rem] mb-2"
        style={{ color: 'var(--color-muted)' }}
      >
        {label}
      </p>
      <p
        className="font-bold leading-none"
        style={{
          fontSize: '3rem',
          color: 'var(--color-ink)',
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {value}
        {unit && (
          <span
            className="font-semibold ml-1"
            style={{ fontSize: '1.25rem' }}
          >
            {unit}
          </span>
        )}
      </p>
      {hint && (
        <p
          className="text-[0.75rem] mt-1.5"
          style={{ color: 'var(--color-muted)' }}
        >
          {hint}
        </p>
      )}
      {drivingNote && (
        <div className="flex items-center gap-1.5 mt-2">
          <p
            className="text-[0.75rem]"
            style={{ color: 'var(--color-muted)' }}
          >
            운전 가능 시점이 아닙니다.
          </p>
          {onInfoClick && (
            <button
              type="button"
              onClick={onInfoClick}
              className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[0.625rem] font-bold"
              style={{
                border: '1px solid var(--color-muted)',
                color: 'var(--color-muted)',
                lineHeight: 1,
              }}
              aria-label="처리 추정 시간 설명 보기"
            >
              i
            </button>
          )}
        </div>
      )}
    </div>
  )
}
