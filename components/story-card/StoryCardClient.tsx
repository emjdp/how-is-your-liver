'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getRecord } from '@/lib/storage'
import { computeDay } from '@/lib/calculate'
import { getDayTier, isHighTier } from '@/lib/tiers'
import { buildCardProps, CARD_TEMPLATES } from '@/data/cardTemplates'
import { safetyLineCard } from '@/lib/safety-copy'
import { StoryCardCanvas } from './StoryCardCanvas'
import type { DayRecord, DayCalc, TierResult } from '@/types/record'

const PENDING_TOAST_KEY = 'hiyl:pending_toast'

export function StoryCardClient({ date }: { date: string }) {
  const router = useRouter()
  const [templateIdx, setTemplateIdx] = useState(0)
  const [cardData, setCardData] = useState<{
    record: DayRecord
    calc: DayCalc
    tier: TierResult
  } | null>(null)
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

    const next = r
      ? (() => {
          const calc = computeDay(r)
          const tier = getDayTier(calc.alcoholG)
          return { record: r, calc, tier }
        })()
      : null
    setCardData(next)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBack = () => {
    router.back()
  }

  if (!cardData) {
    return (
      <div
        className="flex-1 min-h-screen"
        style={{ background: 'var(--color-bg)' }}
      />
    )
  }

  const template = CARD_TEMPLATES[templateIdx]
  const rawProps = buildCardProps(
    template.id,
    cardData.record,
    cardData.calc,
    cardData.tier,
  )
  const props = { ...rawProps, safetyLine: safetyLineCard }

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
            }}
          >
            ←
          </button>
          <p
            className="text-[1.0625rem] font-semibold"
            style={{ color: 'var(--color-deep-green)' }}
          >
            스토리 카드
          </p>
        </div>

        {/* 템플릿 선택 탭 */}
        <div className="flex gap-2 w-full">
          {CARD_TEMPLATES.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplateIdx(i)}
              style={{
                flex: 1,
                height: '44px',
                borderRadius: '12px',
                background:
                  templateIdx === i
                    ? 'var(--color-deep-green)'
                    : 'transparent',
                color:
                  templateIdx === i
                    ? 'var(--color-lime)'
                    : 'var(--color-ink)',
                border:
                  templateIdx === i
                    ? 'none'
                    : '1px solid var(--color-glass-stroke)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 200ms',
              }}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* 카드 미리보기 + 공유 버튼 */}
        <StoryCardCanvas
          templateId={template.id}
          props={props}
          isHighTier={isHighTier(cardData.tier.id)}
        />
      </div>
    </div>
  )
}
