'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getKSTToday, getLast7Days, getDayChar, getDayNumber } from '@/lib/date'
import { getRecordsForDates } from '@/lib/storage'
import { computeWeek, computeDay } from '@/lib/calculate'
import { getWeekTier, isHighTier } from '@/lib/tiers'
import { safetyLineLong } from '@/lib/safety-copy'
import { exportRecordsAsJson } from '@/lib/export'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ResultHero } from './ResultHero'
import { WeeklyBarChart } from './WeeklyBarChart'
import type { BarDay } from './WeeklyBarChart'

function formatMonthDay(dateStr: string): string {
  const [, mm, dd] = dateStr.split('-')
  return `${parseInt(mm)}월 ${parseInt(dd)}일`
}

export function WeeklyClient() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [barDays, setBarDays] = useState<BarDay[]>([])
  const [weekData, setWeekData] = useState<{
    totalAlcoholG: number
    totalSojuEquivBottles: number
    drinkingDays: number
    peakDay: string | null
    peakDayTie: boolean
  } | null>(null)
  const [toast, setToast] = useState({ show: false, message: '' })
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const today = getKSTToday()
    const dates = getLast7Days(today)
    const recordMap = getRecordsForDates(dates)

    const days: BarDay[] = dates.map((date) => {
      const record = recordMap[date]
      const alcoholG = record ? computeDay(record).alcoholG : 0
      return {
        date,
        dayChar: getDayChar(date),
        dayNum: getDayNumber(date),
        hasRecord: !!record,
        alcoholG,
        isToday: date === today,
      }
    })

    const records = Object.values(recordMap)
    const week = computeWeek(records)

    setBarDays(days)
    setWeekData({
      totalAlcoholG: week.totalAlcoholG,
      totalSojuEquivBottles: week.totalSojuEquivBottles,
      drinkingDays: week.drinkingDays,
      peakDay: week.peakDay,
      peakDayTie: week.peakDayTie,
    })
    setReady(true)
  }, [])

  const handleHomeClick = useCallback(() => {
    router.push('/')
  }, [router])

  const handleCardClick = useCallback(() => {
    router.push('/weekly/card')
  }, [router])

  if (!ready || !weekData) {
    return (
      <div
        className="flex-1 min-h-screen"
        style={{ background: 'var(--color-bg)' }}
      />
    )
  }

  const tier = getWeekTier(weekData.totalAlcoholG)
  const high = isHighTier(tier.id)

  const peakDayLabel = (() => {
    if (weekData.drinkingDays === 0) return '—'
    if (weekData.peakDayTie) return '여러 날 동률'
    if (weekData.peakDay) return formatMonthDay(weekData.peakDay)
    return '—'
  })()

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="flex-1 px-5 pt-8 pb-60 flex flex-col gap-6">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between">
          <p
            className="text-[0.875rem]"
            style={{ color: 'var(--color-muted)' }}
          >
            최근 7일 간 정산
          </p>
          <ThemeToggle />
        </div>

        {/* 주간 티어 + 카피 */}
        <ResultHero tier={tier} />

        {/* 핵심 수치 */}
        <div
          className="rounded-[20px] px-6 py-5 flex flex-col gap-4"
          style={{
            background: 'var(--color-surface)',
            boxShadow: '0 8px 32px rgba(11,20,17,0.06)',
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Metric
              label="총 알코올"
              value={`${weekData.totalAlcoholG.toFixed(1)}g`}
            />
            <Metric
              label="소주 환산"
              value={`${weekData.totalSojuEquivBottles.toFixed(1)}병`}
            />
            <Metric
              label="음주일"
              value={`${weekData.drinkingDays}일`}
            />
            <Metric
              label="최다 음주일"
              value={peakDayLabel}
              small={weekData.peakDayTie}
            />
          </div>
        </div>

        {/* 7일 막대 차트 */}
        <div
          className="rounded-[20px] px-5 pt-5 pb-6"
          style={{
            background: 'var(--color-surface)',
            boxShadow: '0 8px 32px rgba(11,20,17,0.06)',
          }}
        >
          <p
            className="text-[0.75rem] font-semibold mb-4"
            style={{ color: 'var(--color-deep-green)' }}
          >
            7일 음주 기록
          </p>
          <WeeklyBarChart days={barDays} />
        </div>

        {/* 안전 안내 */}
        <p
          className="text-[0.75rem] leading-relaxed"
          style={{ color: 'var(--color-muted)' }}
        >
          * {safetyLineLong}
        </p>

        {/* JSON export */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <p
            className="text-[0.7rem]"
            style={{ color: 'var(--color-muted)' }}
          >
            기기 안에만 저장됩니다. 서버로 보내지지 않아요.
          </p>
          <button
            type="button"
            onClick={exportRecordsAsJson}
            className="text-[0.8125rem] px-4 py-2 rounded-xl border transition-colors duration-200"
            style={{
              color: 'var(--color-muted)',
              borderColor: 'var(--color-glass-stroke)',
              background: 'transparent',
            }}
          >
            기록 JSON 저장
          </button>
        </div>
      </div>

      {/* 하단 고정 CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 pt-6 flex flex-col gap-3"
        style={{
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))',
          background:
            'linear-gradient(to top, var(--color-bg) 75%, transparent)',
        }}
      >
        <Button variant="ghost" onClick={handleCardClick}>
          주간 스토리 카드 만들기
        </Button>
        <Button variant="ghost" onClick={handleHomeClick}>
          메인으로 돌아가기
        </Button>
      </div>

      {high && (
        <p
          className="fixed bottom-[13.5rem] left-5 text-[0.75rem]"
          style={{ color: 'var(--color-muted)' }}
        >
          공유는 신중히.
        </p>
      )}

      <Toast
        message={toast.message}
        show={toast.show}
        onHide={() => setToast((p) => ({ ...p, show: false }))}
      />
    </div>
  )
}

function Metric({
  label,
  value,
  small,
}: {
  label: string
  value: string
  small?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <p
        className="text-[0.75rem]"
        style={{ color: 'var(--color-muted)' }}
      >
        {label}
      </p>
      <p
        className="font-bold"
        style={{
          fontSize: small ? '1rem' : '1.375rem',
          color: 'var(--color-ink)',
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {value}
      </p>
    </div>
  )
}
