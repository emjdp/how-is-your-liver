'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getRecord } from '@/lib/storage'
import { computeDay } from '@/lib/calculate'
import { getDayTier, isHighTier } from '@/lib/tiers'
import { formatKoreanDate } from '@/lib/date'
import { safetyLineLong } from '@/lib/safety-copy'
import { Button } from '@/components/ui/Button'
import { ResultHero } from './ResultHero'
import { MetricCard } from './MetricCard'
import type { DayRecord } from '@/types/record'

export const PENDING_TOAST_KEY = 'hiyl:pending_toast'

const INFO_MODAL_TEXT =
  '알코올 처리 추정 시간은 보수적 평균치(8g/h)이며, 개인의 체중·성별·음식 섭취·건강 상태에 따라 크게 달라집니다. 운전 가능 여부 판단에는 사용할 수 없습니다.'

export function ResultClient({ date }: { date: string }) {
  const router = useRouter()

  // null = 로딩 중, undefined = 기록 없음 → 리다이렉트, DayRecord = 정상
  const [record, setRecord] = useState<DayRecord | null | undefined>(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    const dateValid = date && dateRegex.test(date)
    const r = dateValid ? getRecord(date) : undefined

    if (!r) {
      sessionStorage.setItem(PENDING_TOAST_KEY, '이 날의 기록이 없어요.')
      router.replace('/')
    }

    setRecord(r)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEditClick = useCallback(() => {
    router.push(`/?d=${date}`)
  }, [router, date])

  const handleCardClick = useCallback(() => {
    router.push(`/result/card?d=${date}`)
  }, [router, date])

  const handleWeeklyClick = useCallback(() => {
    router.push('/weekly')
  }, [router])

  if (record == null) {
    return (
      <div
        className="flex-1 min-h-screen"
        style={{ background: 'var(--color-bg)' }}
      />
    )
  }

  const calc = computeDay(record)
  const tier = getDayTier(calc.alcoholG)
  const high = isHighTier(tier.id)

  const processHoursDisplay =
    calc.processHours === 0 ? '0시간' : `약 ${calc.processHours}시간`

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="flex-1 px-5 pt-8 pb-60 flex flex-col gap-6">
        {/* 날짜 헤더 */}
        <p
          className="text-[0.875rem]"
          style={{ color: 'var(--color-muted)' }}
        >
          {formatKoreanDate(date)}
        </p>

        {/* 티어 배지 + 카피 */}
        <ResultHero tier={tier} />

        {/* 핵심 수치 3개 */}
        <div className="flex flex-col gap-3">
          <MetricCard
            label="소주환산"
            value={calc.sojuEquivBottles.toFixed(1)}
            unit="병"
          />
          <MetricCard
            label="순수 알코올"
            value={calc.alcoholG.toFixed(1)}
            unit="g"
          />
          <MetricCard
            label="처리 추정 시간"
            value={processHoursDisplay}
            hint="개인차에 따라 ±25%"
            drivingNote
            onInfoClick={() => setShowInfoModal(true)}
          />
        </div>

        {/* 입력 내역 */}
        <div
          className="rounded-[20px] px-6 py-5 flex flex-col gap-3"
          style={{
            background: 'var(--color-surface)',
            boxShadow: '0 8px 32px rgba(11,20,17,0.06)',
          }}
        >
          <p
            className="text-[0.875rem] font-semibold"
            style={{ color: 'var(--color-deep-green)' }}
          >
            입력 내역
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[0.9375rem]">
              <span style={{ color: 'var(--color-muted)' }}>소주</span>
              <span style={{ color: 'var(--color-ink)' }}>
                {record.soju}병
              </span>
            </div>
            <div className="flex justify-between text-[0.9375rem]">
              <span style={{ color: 'var(--color-muted)' }}>맥주</span>
              <span style={{ color: 'var(--color-ink)' }}>
                {record.beer}잔
              </span>
            </div>
            <div
              className="flex justify-between text-[0.9375rem] pt-2 mt-1"
              style={{ borderTop: '1px solid var(--color-glass-stroke)' }}
            >
              <span style={{ color: 'var(--color-muted)' }}>열량</span>
              <span style={{ color: 'var(--color-ink)' }}>
                {calc.kcal} kcal
              </span>
            </div>
          </div>
        </div>

        {/* 안전 안내 */}
        <p
          className="text-[0.75rem] leading-relaxed"
          style={{ color: 'var(--color-muted)' }}
        >
          * {safetyLineLong}
        </p>
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
        <Button variant="primary" onClick={handleCardClick}>
          스토리 카드 만들기
        </Button>
        <Button variant="ghost" onClick={handleEditClick}>
          기록 수정
        </Button>
        <Button variant="ghost" onClick={handleWeeklyClick}>
          최근 7일 간 리포트 보기
        </Button>
      </div>

      {/* 처리 추정 시간 정보 모달 */}
      {showInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ background: 'rgba(11,20,17,0.5)' }}
          onClick={() => setShowInfoModal(false)}
        >
          <div
            className="rounded-[20px] px-6 py-7 w-full max-w-sm"
            style={{ background: 'var(--color-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-[1.0625rem] font-bold mb-3"
              style={{ color: 'var(--color-deep-green)' }}
            >
              처리 추정 시간이란?
            </h2>
            <p
              className="text-[0.875rem] leading-relaxed"
              style={{ color: 'var(--color-ink)' }}
            >
              {INFO_MODAL_TEXT}
            </p>
            <button
              type="button"
              className="mt-5 w-full h-12 rounded-2xl text-[0.9375rem] font-semibold"
              style={{
                background: 'var(--color-deep-green)',
                color: 'var(--color-lime)',
              }}
              onClick={() => setShowInfoModal(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 높은 티어 공유 안내 — 스토리 카드 CTA 보조 카피 */}
      {high && (
        <p
          className="fixed bottom-[13.5rem] left-5 text-[0.75rem]"
          style={{ color: 'var(--color-muted)' }}
        >
          공유는 신중히.
        </p>
      )}

    </div>
  )
}
