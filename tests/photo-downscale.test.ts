import { describe, it, expect } from 'vitest'
import { computeDownscaleDimensions, isFileTooLarge } from '@/lib/photoDownscale'

describe('computeDownscaleDimensions', () => {
  it('긴 변이 maxLong 이하이면 원본 치수 반환', () => {
    expect(computeDownscaleDimensions(1080, 1920, 2160)).toEqual({ w: 1080, h: 1920 })
  })

  it('정사각형이 maxLong 이하이면 원본 반환', () => {
    expect(computeDownscaleDimensions(2000, 2000, 2160)).toEqual({ w: 2000, h: 2000 })
  })

  it('세로 사진: 세로가 maxLong 초과 시 비율 유지해 축소', () => {
    const result = computeDownscaleDimensions(1080, 4320, 2160)
    expect(result.h).toBe(2160)
    expect(result.w).toBe(540)
  })

  it('가로 사진: 가로가 maxLong 초과 시 비율 유지해 축소', () => {
    const result = computeDownscaleDimensions(4000, 3000, 2160)
    expect(result.w).toBe(2160)
    expect(result.h).toBe(Math.round(3000 * (2160 / 4000)))
  })

  it('정사각형이 maxLong 초과 시 maxLong × maxLong', () => {
    const result = computeDownscaleDimensions(4320, 4320, 2160)
    expect(result.w).toBe(2160)
    expect(result.h).toBe(2160)
  })

  it('기본 maxLong 2160 사용', () => {
    const result = computeDownscaleDimensions(5400, 9600)
    expect(result.h).toBe(2160)
    expect(result.w).toBe(Math.round(5400 * (2160 / 9600)))
  })

  it('srcW/srcH가 0이면 0 반환', () => {
    expect(computeDownscaleDimensions(0, 0)).toEqual({ w: 0, h: 0 })
  })
})

describe('isFileTooLarge', () => {
  it('10MB 초과 파일은 true', () => {
    const file = { size: 10 * 1024 * 1024 + 1 } as File
    expect(isFileTooLarge(file)).toBe(true)
  })

  it('정확히 10MB는 false', () => {
    const file = { size: 10 * 1024 * 1024 } as File
    expect(isFileTooLarge(file)).toBe(false)
  })

  it('1MB는 false', () => {
    const file = { size: 1024 * 1024 } as File
    expect(isFileTooLarge(file)).toBe(false)
  })
})
