'use client'

import { useState, useCallback } from 'react'
import { shareOrDownload, shareText } from '@/lib/share'
import { Toast } from '@/components/ui/Toast'

interface ShareButtonProps {
  capture: () => Promise<Blob>
  fallbackText?: string
  isHighTier?: boolean
}

export function ShareButton({
  capture,
  fallbackText = '',
  isHighTier = false,
}: ShareButtonProps) {
  const [capturing, setCapturing] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '' })

  const handleShare = useCallback(async () => {
    if (capturing) return
    setCapturing(true)
    try {
      const blob = await capture()
      const acted = await shareOrDownload(blob)
      if (acted) {
        const msg = isHighTier
          ? '저장 완료.'
          : '저장 완료 — 스토리에 올려보세요.'
        setToast({ show: true, message: msg })
      }
    } catch {
      if (fallbackText) {
        try {
          await shareText(fallbackText)
        } catch {
          // 조용히 무시
        }
      }
      setToast({ show: true, message: '이미지 생성에 실패했습니다.' })
    } finally {
      setCapturing(false)
    }
  }, [capturing, capture, fallbackText, isHighTier])

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        disabled={capturing}
        aria-label="카드 저장 또는 공유"
        style={{
          width: '90vw',
          maxWidth: '400px',
          height: '56px',
          borderRadius: '16px',
          background: 'var(--color-deep-green)',
          color: 'var(--color-lime)',
          fontSize: '0.9375rem',
          fontWeight: 700,
          border: 'none',
          cursor: capturing ? 'default' : 'pointer',
          opacity: capturing ? 0.55 : 1,
          transition: 'opacity 200ms',
        }}
      >
        {capturing ? '이미지 생성 중…' : '저장 / 공유하기'}
      </button>

      <Toast
        message={toast.message}
        show={toast.show}
        onHide={() => setToast((p) => ({ ...p, show: false }))}
      />
    </>
  )
}
