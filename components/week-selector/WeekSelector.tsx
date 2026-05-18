'use client'

import { GlassPanel } from '@/components/ui/GlassPanel'
import { DayPill } from './DayPill'
import { getDayChar, getDayNumber } from '@/lib/date'

interface WeekSelectorProps {
  dates: string[]
  selectedDate: string
  today: string
  recordDates: Set<string>
  onSelect: (date: string) => void
}

export function WeekSelector({
  dates,
  selectedDate,
  today,
  recordDates,
  onSelect,
}: WeekSelectorProps) {
  return (
    <div
      className="sticky z-10 px-5 py-3"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 0px)' }}
    >
      <GlassPanel>
        <div className="flex justify-between">
          {dates.map((date) => (
            <DayPill
              key={date}
              date={date}
              dayChar={getDayChar(date)}
              dayNum={getDayNumber(date)}
              isSelected={date === selectedDate}
              isToday={date === today}
              hasRecord={recordDates.has(date)}
              onClick={() => onSelect(date)}
            />
          ))}
        </div>
      </GlassPanel>
    </div>
  )
}
