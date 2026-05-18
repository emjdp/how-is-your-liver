'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { toPng } from 'html-to-image'
import { TplReport } from './templates/TplReport'
import { TplOvertime } from './templates/TplOvertime'
import { TplForecast } from './templates/TplForecast'
import { TplWarning } from './templates/TplWarning'
import { TplWeekly } from './templates/TplWeekly'
import { ShareButton } from './ShareButton'
import type { DayCardProps, WeekCardProps } from '@/data/cardTemplates'

const CANVAS_W = 1080
const CANVAS_H = 1920

interface StoryCardCanvasProps {
  templateId: string
  props: DayCardProps | WeekCardProps
  isHighTier?: boolean
}

function isDayProps(props: DayCardProps | WeekCardProps): props is DayCardProps {
  return 'date' in props
}

export function StoryCardCanvas({ templateId, props, isHighTier = false }: StoryCardCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.31)

  useEffect(() => {
    const update = () => {
      if (wrapperRef.current) {
        const w = wrapperRef.current.offsetWidth
        setScale(w / CANVAS_W)
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const capture = useCallback(async (): Promise<Blob> => {
    if (!canvasRef.current) throw new Error('캔버스 참조 없음')
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      await document.fonts.ready
    }
    const dataUrl = await toPng(canvasRef.current, {
      pixelRatio: 1,
      cacheBust: true,
      width: CANVAS_W,
      height: CANVAS_H,
      style: {
        transform: 'none',
        transformOrigin: 'top left',
        width: `${CANVAS_W}px`,
        height: `${CANVAS_H}px`,
      },
    })
    const res = await fetch(dataUrl)
    if (!res.ok) throw new Error('dataUrl fetch 실패')
    return res.blob()
  }, [])

  function renderTemplate() {
    if (templateId === 'tpl_weekly') {
      if (!isDayProps(props)) {
        return <TplWeekly props={props as WeekCardProps} />
      }
      return null
    }
    // day 템플릿은 모두 DayCardProps 사용
    const dayProps = isDayProps(props) ? props : null
    if (!dayProps) return null
    switch (templateId) {
      case 'tpl_report':
        return <TplReport props={dayProps} />
      case 'tpl_overtime':
        return <TplOvertime props={dayProps} />
      case 'tpl_forecast':
        return <TplForecast props={dayProps} />
      case 'tpl_warning':
        return <TplWarning props={dayProps} />
      default:
        return <TplReport props={dayProps} />
    }
  }

  const fallbackText = isDayProps(props)
    ? `당신의 간은 안녕하십니까? ${props.cardLine} — 알코올 ${props.alcoholG.toFixed(0)}g`
    : `당신의 간은 안녕하십니까? ${props.cardLine} — 7일 알코올 ${props.totalAlcoholG.toFixed(0)}g`

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* 미리보기 래퍼: 90vw, 9:16 비율, overflow hidden */}
      <div
        ref={wrapperRef}
        style={{
          width: '90vw',
          maxWidth: '400px',
          aspectRatio: '9 / 16',
          overflow: 'hidden',
          borderRadius: '20px',
          position: 'relative',
          boxShadow: '0 16px 48px rgba(11,20,17,0.18)',
        }}
      >
        {/* 1080×1920 캔버스 (CSS scale로 축소 표시, 캡처 시 원본 크기 사용) */}
        <div
          ref={canvasRef}
          style={{
            width: `${CANVAS_W}px`,
            height: `${CANVAS_H}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {renderTemplate()}
        </div>
      </div>

      {/* 공유/저장 버튼 */}
      <ShareButton capture={capture} fallbackText={fallbackText} isHighTier={isHighTier} />
    </div>
  )
}
