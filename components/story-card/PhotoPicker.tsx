'use client'

import { useRef, useState } from 'react'
import { downscaleImageFile, isFileTooLarge } from '@/lib/photoDownscale'

interface PhotoPickerProps {
  value: string | null
  onChange: (dataUrl: string | null) => void
}

export function PhotoPicker({ value, onChange }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 선택 초기화 — 같은 파일 재선택 가능
    e.target.value = ''

    if (isFileTooLarge(file)) {
      setError('10MB 이하 사진만 사용할 수 있어요.')
      return
    }

    setError(null)
    setProcessing(true)
    try {
      const dataUrl = await downscaleImageFile(file)
      onChange(dataUrl)
    } catch {
      setError('사진을 불러오지 못했어요.')
    } finally {
      setProcessing(false)
    }
  }

  const handleRemove = () => {
    onChange(null)
    setError(null)
  }

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {/* 사진 선택/변경 버튼 */}
        <button
          type="button"
          disabled={processing}
          onClick={() => inputRef.current?.click()}
          style={{
            height: '36px',
            padding: '0 14px',
            borderRadius: '10px',
            border: '1px solid var(--color-glass-stroke)',
            background: 'transparent',
            color: 'var(--color-ink)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: processing ? 'default' : 'pointer',
            opacity: processing ? 0.5 : 1,
            transition: 'opacity 150ms',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {processing ? '처리 중…' : value ? '사진 변경' : '사진 배경 추가'}
        </button>

        {/* 사진 제거 버튼 */}
        {value && !processing && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="사진 제거"
            style={{
              height: '36px',
              padding: '0 12px',
              borderRadius: '10px',
              border: '1px solid var(--color-glass-stroke)',
              background: 'transparent',
              color: 'var(--color-muted)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            제거
          </button>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-warn)',
          }}
        >
          {error}
        </span>
      )}

      {/* 개인정보 안내 — 작고 조용하게 */}
      <span
        style={{
          fontSize: '0.6875rem',
          color: 'var(--color-muted)',
          lineHeight: 1.4,
        }}
      >
        사진은 기기 안에서만 사용되고 서버로 전송되지 않아요.
      </span>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    </div>
  )
}
