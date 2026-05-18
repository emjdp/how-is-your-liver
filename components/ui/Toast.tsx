'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  show: boolean
  onHide: () => void
}

export function Toast({ message, show, onHide }: ToastProps) {
  useEffect(() => {
    if (!show) return
    const t = setTimeout(onHide, 2500)
    return () => clearTimeout(t)
  }, [show, onHide])

  if (!show) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-5 py-3 text-[0.9375rem] font-medium"
      style={{
        background: 'var(--color-deep-green)',
        color: 'var(--color-lime)',
        boxShadow: '0 8px 32px rgba(11,20,17,0.18)',
      }}
    >
      {message}
    </div>
  )
}
