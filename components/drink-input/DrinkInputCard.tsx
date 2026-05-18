'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { formatKoreanDate } from '@/lib/date'
import { computeDay } from '@/lib/calculate'
import { getDayTier } from '@/lib/tiers'
import { StepperRow } from './StepperRow'

interface DrinkInputCardProps {
  date: string
  soju: number
  beer: number
  onSojuChange: (v: number) => void
  onBeerChange: (v: number) => void
  saveStatus: 'idle' | 'saving' | 'saved'
}

export function DrinkInputCard({
  date,
  soju,
  beer,
  onSojuChange,
  onBeerChange,
  saveStatus,
}: DrinkInputCardProps) {
  const calc = computeDay({ date, soju, beer, updatedAt: 0 })
  const tier = getDayTier(calc.alcoholG)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={date}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-[20px] p-6 flex flex-col gap-5"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid rgba(11,20,17,0.06)',
          boxShadow: '0 8px 32px rgba(11,20,17,0.06)',
        }}
      >
        {/* 상단: 날짜 라벨 + 저장 상태 */}
        <div className="flex items-center justify-between">
          <p className="text-[0.75rem]" style={{ color: 'var(--color-muted)' }}>
            {formatKoreanDate(date)}
          </p>
          <span
            className="text-[0.75rem] transition-opacity duration-300"
            style={{
              color: 'var(--color-muted)',
              opacity: saveStatus === 'idle' ? 0 : 1,
            }}
          >
            {saveStatus === 'saving' ? '저장 중…' : '✓ 저장됨'}
          </span>
        </div>

        {/* 소주 스테퍼 */}
        <StepperRow type="soju" value={soju} onChange={onSojuChange} />

        {/* 구분선 */}
        <div className="h-px" style={{ background: 'var(--color-glass-stroke)' }} />

        {/* 맥주 스테퍼 */}
        <StepperRow type="beer" value={beer} onChange={onBeerChange} />

        {/* 미니 티어 */}
        <div
          className="rounded-xl px-4 py-2.5"
          style={{ background: 'rgba(11,20,17,0.04)' }}
        >
          <p className="text-[0.75rem] leading-snug" style={{ color: 'var(--color-muted)' }}>
            현재:{' '}
            <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>
              {tier.name}
            </span>{' '}
            — {tier.safetyLine}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
