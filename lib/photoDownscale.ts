/**
 * 사진 다운스케일 유틸리티
 * 서버 전송 없음 — 모든 처리는 클라이언트 canvas에서만.
 */

const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10MB
const DEFAULT_MAX_LONG = 2160

/** 긴 변이 maxLong을 넘지 않도록 치수 계산 (순수 함수, 테스트 가능) */
export function computeDownscaleDimensions(
  srcW: number,
  srcH: number,
  maxLong = DEFAULT_MAX_LONG
): { w: number; h: number } {
  const longSide = Math.max(srcW, srcH)
  if (longSide <= maxLong) return { w: srcW, h: srcH }
  const ratio = maxLong / longSide
  return { w: Math.round(srcW * ratio), h: Math.round(srcH * ratio) }
}

/** 파일 크기 초과 여부 확인 */
export function isFileTooLarge(file: File): boolean {
  return file.size > MAX_FILE_BYTES
}

/**
 * File → 다운스케일된 dataURL (JPEG)
 * canvas 사용 — 브라우저 전용.
 * 원본 파일은 메모리에서 즉시 해제.
 */
export async function downscaleImageFile(
  file: File,
  maxLong = DEFAULT_MAX_LONG
): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const { w, h } = computeDownscaleDimensions(
        img.naturalWidth,
        img.naturalHeight,
        maxLong
      )

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('canvas 2d context를 가져올 수 없습니다.'))
        return
      }

      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.88))
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('이미지 로드에 실패했습니다.'))
    }

    img.src = objectUrl
  })
}
