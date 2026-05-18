'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getKSTToday, getLast7Days } from '@/lib/date'
import { getRecordsForDates } from '@/lib/storage'
import { computeWeek } from '@/lib/calculate'
import { getWeekTier, isHighTier } from '@/lib/tiers'
import { buildWeekCardProps } from '@/data/cardTemplates'
import { StoryCardCanvas } from './StoryCardCanvas'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import type { WeekCardProps } from '@/data/cardTemplates'

export function WeeklyCardClient() {
  const router = useRouter()
  const [cardProps, setCardProps] = useState<WeekCardProps | null>(null)
  const [highTier, setHighTier] = useState(false)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const today = getKSTToday()
    const dates = getLast7Days(today)
    const recordMap = getRecordsForDates(dates)
    const records = Object.values(recordMap)

    const weekCalc = computeWeek(records)
    const tier = getWeekTier(weekCalc.totalAlcoholG)

    const props = buildWeekCardProps(
      'tpl_weekly',
      dates[0],
      dates[dates.length - 1],
      weekCalc,
      tier,
    )

    setCardProps(props)
    setHighTier(isHighTier(tier.id))
  }, [])

  const handleBack = () => {
    router.back()
  }

  const handleWeekly = () => {
    router.push('/weekly')
  }

  if (!cardProps) {
    return (
      <div
        className="flex-1 min-h-screen"
        style={{ background: 'var(--color-bg)' }}
      />
    )
  }

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="flex-1 px-5 pt-8 pb-40 flex flex-col items-center gap-6">
        {/* 페이지 헤더 */}
        <div className="w-full flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            aria-label="뒤로 가기"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: '1px solid var(--color-glass-stroke)',
              background: 'transparent',
              color: 'var(--color-ink)',
              fontSize: '1.125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ←
          </button>
          <p
            className="flex-1 text-[1.0625rem] font-semibold"
            style={{ color: 'var(--color-deep-green)' }}
          >
            주간 스토리 카드
          </p>
          <ThemeToggle />
        </div>

        {/* 카드 미리보기 + 공유 버튼 */}
        <StoryCardCanvas
          templateId="tpl_weekly"
          props={cardProps}
          isHighTier={highTier}
        />

        {/* 주간 리포트로 돌아가기 */}
        <button
          type="button"
          onClick={handleWeekly}
          style={{
            height: '44px',
            padding: '0 24px',
            borderRadius: '12px',
            border: '1px solid var(--color-glass-stroke)',
            background: 'transparent',
            color: 'var(--color-muted)',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          주간 리포트로 돌아가기
        </button>
      </div>
    </div>
  )
}
