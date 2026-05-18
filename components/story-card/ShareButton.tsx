'use client'

import { useState, useCallback } from 'react'
import { shareOrDownload, shareText } from '@/lib/share'
import { Toast } from '@/components/ui/Toast'

interface ShareButtonProps {
  /** 호출 시 PNG Blob을 반환하는 캡처 함수 */
  capture: () => Promise<Blob>
  /** 캡처 실패 시 텍스트 공유용 폴백 문자열 */
  fallbackText?: string
}

export function ShareButton({ capture, fallbackText = '' }: ShareButtonProps) {
  const [capturing, setCapturing] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '' })

  const handleShare = useCallback(async () => {
    if (capturing) return
    setCapturing(true)
    try {
      const blob = await capture()
      await shareOrDownload(blob)
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
  }, [capturing, capture, fallbackText])

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
