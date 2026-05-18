'use client'

import { useState, useEffect, useRef } from 'react'
import { getTheme, setTheme, applyTheme, nextTheme } from '@/lib/theme'
import type { ThemeMode } from '@/lib/theme'

const ICON: Record<ThemeMode, string> = {
  system: '◑',
  light: '○',
  dark: '●',
}

const LABEL: Record<ThemeMode, string> = {
  system: '자동',
  light: '밝음',
  dark: '어둠',
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('system')
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    // localStorage → DOM class 동기화 (inline script가 이미 적용했더라도 재확인)
    const stored = getTheme()
    applyTheme(stored)
    setMode(stored)
  }, [])

  const handleClick = () => {
    const next = nextTheme(mode)
    setTheme(next)
    setMode(next)
  }

  const next = nextTheme(mode)

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`테마 ${LABEL[mode]} — 클릭하면 ${LABEL[next]}으로 전환`}
      title={`테마: ${LABEL[mode]}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '44px',
        height: '44px',
        minWidth: '44px',
        borderRadius: '12px',
        border: '1px solid var(--color-glass-stroke)',
        background: 'transparent',
        color: 'var(--color-ink)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'border-color 150ms, color 150ms',
      }}
    >
      <span style={{ fontSize: '1rem', lineHeight: 1, userSelect: 'none' }}>
        {ICON[mode]}
      </span>
    </button>
  )
}
