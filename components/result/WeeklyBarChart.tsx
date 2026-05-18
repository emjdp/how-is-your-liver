export interface BarDay {
  date: string
  dayChar: string
  dayNum: number
  hasRecord: boolean
  alcoholG: number
  isToday: boolean
}

interface WeeklyBarChartProps {
  days: BarDay[]
}

const BAR_MAX_PX = 120

export function WeeklyBarChart({ days }: WeeklyBarChartProps) {
  const maxG = Math.max(
    1,
    ...days.filter((d) => d.hasRecord && d.alcoholG > 0).map((d) => d.alcoholG)
  )

  return (
    <div className="flex gap-2">
      {days.map((day) => {
        const barPx = day.hasRecord && day.alcoholG > 0
          ? Math.max(6, Math.round((day.alcoholG / maxG) * BAR_MAX_PX))
          : 0

        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
            {/* Bar container */}
            <div
              className="w-full relative rounded-lg"
              style={{ height: BAR_MAX_PX }}
            >
              {/* No record: full-height gray slot */}
              {!day.hasRecord && (
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'var(--color-glass-stroke)' }}
                />
              )}
              {/* Has record: lime bar from bottom */}
              {day.hasRecord && day.alcoholG > 0 && (
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-lg"
                  style={{
                    height: barPx,
                    background: 'var(--color-lime)',
                  }}
                />
              )}
              {/* 0/0 record: lime baseline marker */}
              {day.hasRecord && day.alcoholG === 0 && (
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-sm"
                  style={{ height: 3, background: 'var(--color-lime)' }}
                />
              )}
            </div>

            {/* Day of week */}
            <span
              className="text-[0.6875rem] font-medium"
              style={{
                color: day.isToday
                  ? 'var(--color-deep-green)'
                  : day.hasRecord
                  ? 'var(--color-ink)'
                  : 'var(--color-muted)',
                fontWeight: day.isToday ? 700 : 500,
              }}
            >
              {day.dayChar}
            </span>

            {/* Date number */}
            <span
              className="text-[0.625rem]"
              style={{ color: 'var(--color-muted)' }}
            >
              {day.dayNum}
            </span>
          </div>
        )
      })}
    </div>
  )
}
