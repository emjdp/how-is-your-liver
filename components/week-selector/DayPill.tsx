'use client'

interface DayPillProps {
  date: string
  dayChar: string
  dayNum: number
  isSelected: boolean
  isToday: boolean
  hasRecord: boolean
  onClick: () => void
}

export function DayPill({
  date,
  dayChar,
  dayNum,
  isSelected,
  isToday,
  hasRecord,
  onClick,
}: DayPillProps) {
  return (
    <button
      type="button"
      aria-label={`${date}${isToday ? ' 오늘' : ''}`}
      aria-pressed={isSelected}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center w-11 h-11 rounded-full shrink-0 transition-all duration-200"
      style={
        isSelected
          ? {
              background: 'rgba(15,61,46,0.10)',
              border: '1px solid var(--color-glass-stroke)',
              backdropFilter: 'blur(10px)',
            }
          : { border: '1px solid transparent' }
      }
    >
      <span
        className="text-[0.625rem] font-medium leading-none"
        style={{ color: isSelected ? 'var(--color-deep-green)' : 'var(--color-muted)' }}
      >
        {dayChar}
      </span>
      <span
        className="text-[0.875rem] font-semibold leading-none mt-0.5"
        style={{ color: isSelected ? 'var(--color-ink)' : 'var(--color-muted)' }}
      >
        {dayNum}
      </span>

      {/* today 라임 닷 */}
      {isToday && (
        <span
          className="absolute bottom-1 w-1 h-1 rounded-full"
          style={{ background: 'var(--color-lime)' }}
        />
      )}
      {/* 기록 있는 날 닷 (today 아닐 때) */}
      {hasRecord && !isToday && (
        <span
          className="absolute bottom-1 w-1 h-1 rounded-full"
          style={{ background: 'var(--color-lime)', opacity: 0.6 }}
        />
      )}
    </button>
  )
}
