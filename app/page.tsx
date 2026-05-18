'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getKSTToday, getLast7Days } from '@/lib/date'
import {
  getRecordsForDates,
  saveRecord,
  isStorageAvailable,
} from '@/lib/storage'
import { clampInput } from '@/lib/calculate'
import { WeekSelector } from '@/components/week-selector/WeekSelector'
import { DrinkInputCard } from '@/components/drink-input/DrinkInputCard'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Mascot } from '@/components/ui/Mascot'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { PENDING_TOAST_KEY } from '@/components/result/ResultClient'
import type { DayRecord, DrinkType } from '@/types/record'

type SaveStatus = 'idle' | 'saving' | 'saved'

type PageInit = {
  today: string
  dates: string[]
  selectedDate: string
  records: Record<string, DayRecord>
  storageWarning: boolean
}

function loadInit(): PageInit {
  const today = getKSTToday()
  const dates = getLast7Days(today)
  return {
    today,
    dates,
    selectedDate: today,
    records: getRecordsForDates(dates),
    storageWarning: !isStorageAvailable(),
  }
}

export default function Home() {
  const router = useRouter()

  const [init, setInit] = useState<PageInit | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [records, setRecords] = useState<Record<string, DayRecord>>({})
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [toast, setToast] = useState({ show: false, message: '' })

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initializedRef = useRef(false)
  const recordsRef = useRef<Record<string, DayRecord>>({})

  // 초기화: 브라우저에서만 LocalStorage 접근
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    const data = loadInit()
    setInit(data)
    const urlDate = new URLSearchParams(window.location.search).get('d') ?? ''
    const initialDate = (urlDate && data.dates.includes(urlDate)) ? urlDate : data.selectedDate
    setSelectedDate(initialDate)
    recordsRef.current = data.records
    setRecords(data.records)

    const pendingMsg = sessionStorage.getItem(PENDING_TOAST_KEY) ?? ''
    if (pendingMsg) sessionStorage.removeItem(PENDING_TOAST_KEY)
    setToast({ show: !!pendingMsg, message: pendingMsg })
  }, [])

  const today = init?.today ?? ''
  const dates = init?.dates ?? []
  const storageWarning = init?.storageWarning ?? false

  const currentRecord = records[selectedDate]
  const soju      = currentRecord?.soju      ?? 0
  const sojuGlass = currentRecord?.sojuGlass ?? 0
  const beer      = currentRecord?.beer      ?? 0
  const highball  = currentRecord?.highball  ?? 0

  // ± 버튼 조작 시에만 호출 — DayRecord 생성 조건
  const scheduleSave = useCallback(
    (record: DayRecord) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      setSaveStatus('saving')
      saveTimerRef.current = setTimeout(() => {
        saveRecord(record)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 1500)
      }, 500)
    },
    []
  )

  const handleDrinkChange = useCallback(
    (type: DrinkType, value: number) => {
      if (!selectedDate) return
      const clamped = clampInput(value, type)
      const cur = recordsRef.current[selectedDate]
      const updated: DayRecord = {
        date: selectedDate,
        soju: type === 'soju' ? clamped : cur?.soju ?? 0,
        sojuGlass: type === 'sojuGlass' ? clamped : cur?.sojuGlass ?? 0,
        beer: type === 'beer' ? clamped : cur?.beer ?? 0,
        highball: type === 'highball' ? clamped : cur?.highball ?? 0,
        updatedAt: Date.now(),
      }
      const nextRecords = { ...recordsRef.current, [selectedDate]: updated }
      recordsRef.current = nextRecords
      setRecords(nextRecords)
      scheduleSave(updated)
    },
    [selectedDate, scheduleSave]
  )

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date)
  }, [])

  const handleResultClick = useCallback(() => {
    router.push(`/result?d=${selectedDate}`)
  }, [router, selectedDate])

  const handleWeeklyClick = useCallback(() => {
    router.push('/weekly')
  }, [router])

  const recordDates = new Set(Object.keys(records))

  return (
    <main
      className="relative flex flex-col min-h-screen"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* LocalStorage 미지원 경고 */}
      {storageWarning && (
        <div
          className="px-5 py-2 text-center text-[0.75rem]"
          style={{ background: 'var(--color-warn)', color: '#fff' }}
        >
          기록이 저장되지 않을 수 있어요. (개인정보 보호 모드)
        </div>
      )}

      {/* 요일 선택 바 */}
      {selectedDate && dates.length > 0 && (
        <WeekSelector
          dates={dates}
          selectedDate={selectedDate}
          today={today}
          recordDates={recordDates}
          onSelect={handleDateSelect}
        />
      )}

      {/* 스크린리더용 저장 상태 aria-live */}
      <span aria-live="polite" className="sr-only">
        {saveStatus === 'saving' ? '저장 중' : saveStatus === 'saved' ? '저장됨' : ''}
      </span>

      {/* 본문 콘텐츠 */}
      <div className="flex-1 px-5 pt-2 pb-44 flex flex-col gap-5">
        {/* 앱 헤더 */}
        <div className="pt-2">
          <div className="flex items-center gap-3">
            <h1
              className="flex-1 min-w-0 text-[1.375rem] font-bold leading-snug"
              style={{ color: 'var(--color-deep-green)' }}
            >
              당신의 간은 안녕하십니까?
            </h1>
            <Mascot size={48} alt="" className="flex-shrink-0" />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[0.75rem]" style={{ color: 'var(--color-muted)' }}>
              소주·맥주·하이볼 음주량을 기록하고, 오늘의 간 상태를 확인하세요.
            </p>
            <ThemeToggle />
          </div>
        </div>

        {/* 음주 입력 카드 */}
        {selectedDate && (
          <DrinkInputCard
            date={selectedDate}
            soju={soju}
            sojuGlass={sojuGlass}
            beer={beer}
            highball={highball}
            onDrinkChange={handleDrinkChange}
            saveStatus={saveStatus}
          />
        )}
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
        <Button variant="primary" onClick={handleResultClick}>
          이 날의 간 상태 보기
        </Button>
        <Button variant="ghost" onClick={handleWeeklyClick}>
          최근 7일 간 리포트 보기
        </Button>
      </div>

      {/* 토스트 */}
      <Toast
        message={toast.message}
        show={toast.show}
        onHide={() => setToast((p) => ({ ...p, show: false }))}
      />
    </main>
  )
}
