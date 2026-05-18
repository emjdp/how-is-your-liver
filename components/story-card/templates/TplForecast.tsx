import type { DayCardProps } from '@/data/cardTemplates'
import { isHighTier } from '@/lib/tiers'

/* ─── 고정 색상 (html-to-image 캡처 안정성을 위해 CSS 변수 대신 하드코딩) ─── */
const C_WHITE = '#FFFFFF'
const C_LIME = '#C8F26C'
const C_WARN = '#D9342B'
const C_BG_TOP = '#0D3526'
const C_BG_BOT = '#081209'

function formatCardDate(dateStr: string): string {
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const [y, m, d] = parts
  const dayIdx = new Date(`${dateStr}T12:00:00`).getDay()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${y}.${m}.${d} ${days[dayIdx]}`
}

function getForecastSummary(processHours: number, isHigh: boolean): string {
  if (processHours === 0) return '오늘 간은 평화롭습니다.'
  if (isHigh) return '내일 컨디션은 비공개입니다.'
  if (processHours <= 4) return '가벼운 안개 예상.'
  if (processHours <= 8) return '오전 흐림 예상.'
  return '장기간 흐림 예상.'
}

/* 구름/날씨 심볼 SVG (외곽선만, 면 채움 없음) */
function WeatherIcon({ processHours, isHigh, accentColor }: { processHours: number; isHigh: boolean; accentColor: string }) {
  if (processHours === 0) {
    // 해 (원 외곽선)
    return (
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ display: 'block' }}>
        <circle cx="80" cy="80" r="36" fill="none" stroke={accentColor} strokeWidth="5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180
          return (
            <line
              key={deg}
              x1={80 + 48 * Math.cos(rad)}
              y1={80 + 48 * Math.sin(rad)}
              x2={80 + 60 * Math.cos(rad)}
              y2={80 + 60 * Math.sin(rad)}
              stroke={accentColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
          )
        })}
      </svg>
    )
  }
  if (processHours <= 6) {
    // 해 + 구름 (부분 흐림)
    return (
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ display: 'block' }}>
        <circle cx="65" cy="62" r="26" fill="none" stroke={accentColor} strokeWidth="4" opacity="0.5" />
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const rad = (deg * Math.PI) / 180
          return (
            <line
              key={deg}
              x1={65 + 35 * Math.cos(rad)}
              y1={62 + 35 * Math.sin(rad)}
              x2={65 + 44 * Math.cos(rad)}
              y2={62 + 44 * Math.sin(rad)}
              stroke={accentColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.5"
            />
          )
        })}
        <ellipse cx="92" cy="98" rx="36" ry="22" fill="none" stroke={isHigh ? C_WARN : 'rgba(255,255,255,0.55)'} strokeWidth="4.5" />
        <ellipse cx="76" cy="104" rx="20" ry="18" fill="none" stroke={isHigh ? C_WARN : 'rgba(255,255,255,0.55)'} strokeWidth="4.5" />
        <ellipse cx="112" cy="104" rx="18" ry="16" fill="none" stroke={isHigh ? C_WARN : 'rgba(255,255,255,0.55)'} strokeWidth="4.5" />
      </svg>
    )
  }
  // 구름 (흐림/비)
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" style={{ display: 'block' }}>
      <ellipse cx="84" cy="74" rx="44" ry="28" fill="none" stroke={isHigh ? C_WARN : 'rgba(255,255,255,0.6)'} strokeWidth="5" />
      <ellipse cx="60" cy="84" rx="26" ry="22" fill="none" stroke={isHigh ? C_WARN : 'rgba(255,255,255,0.6)'} strokeWidth="5" />
      <ellipse cx="110" cy="84" rx="22" ry="20" fill="none" stroke={isHigh ? C_WARN : 'rgba(255,255,255,0.6)'} strokeWidth="5" />
      {processHours >= 10 && [60, 80, 100, 120].map((x, i) => (
        <line
          key={x}
          x1={x}
          y1={110 + i * 2}
          x2={x - 8}
          y2={130 + i * 2}
          stroke={isHigh ? C_WARN : 'rgba(255,255,255,0.35)'}
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

export function TplForecast({ props }: { props: DayCardProps }) {
  const isHigh = isHighTier(props.tierId)

  const accentColor = isHigh ? C_WARN : C_LIME
  const badgeBg = isHigh ? 'transparent' : 'rgba(200,242,108,0.1)'
  const badgeBorder = isHigh ? `2px solid ${C_WARN}` : '1.5px solid rgba(200,242,108,0.28)'
  const badgeTextColor = isHigh ? C_WARN : C_LIME

  const forecastSummary = getForecastSummary(props.processHours, isHigh)
  const mainHours = props.processHours === 0 ? '0' : `${props.processHours}`

  return (
    <div
      style={{
        width: '1080px',
        height: '1920px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily:
          '"Pretendard Variable", Pretendard, "Inter Variable", Inter, sans-serif',
      }}
    >
      {/* 배경 그라데이션 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(170deg, ${C_BG_TOP} 0%, ${C_BG_BOT} 100%)`,
          filter: isHigh ? 'saturate(0.8) brightness(0.9)' : undefined,
        }}
      />

      {/* SVG 노이즈 텍스처 */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          inset: 0,
          width: '1080px',
          height: '1920px',
          pointerEvents: 'none',
        }}
      >
        <filter id="noise-forecast">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width="1080"
          height="1920"
          fill={C_WHITE}
          filter="url(#noise-forecast)"
          opacity="0.06"
        />
      </svg>

      {/* 콘텐츠 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '120px 70px 200px',
          boxSizing: 'border-box',
        }}
      >
        {/* ── 헤더 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div
            style={{
              padding: '14px 36px',
              borderRadius: '12px',
              border: `1.5px solid rgba(200,242,108,0.3)`,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: '34px',
                fontWeight: 700,
                color: `rgba(200,242,108,0.75)`,
                letterSpacing: '0',
              }}
            >
              숙취 예보
            </span>
          </div>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span
            style={{
              fontSize: '34px',
              fontWeight: 500,
              color: `rgba(255,255,255,0.35)`,
              letterSpacing: '0',
            }}
          >
            당신의 간은 안녕하십니까?
          </span>
        </div>

        {/* 날짜 */}
        <div style={{ marginTop: '32px' }}>
          <span
            style={{
              fontSize: '40px',
              color: `rgba(200,242,108,0.5)`,
              fontWeight: 500,
            }}
          >
            {formatCardDate(props.date)}
          </span>
        </div>

        {/* 구분선 */}
        <div
          style={{
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
            margin: '48px 0 56px',
          }}
        />

        {/* ── 메인 히어로 ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            gap: '0',
          }}
        >
          {/* 날씨 아이콘 */}
          <div style={{ marginBottom: '40px' }}>
            <WeatherIcon processHours={props.processHours} isHigh={isHigh} accentColor={accentColor} />
          </div>

          {/* 섹션 레이블 */}
          <span
            style={{
              fontSize: '36px',
              color: `rgba(200,242,108,0.45)`,
              fontWeight: 500,
              letterSpacing: '0',
              marginBottom: '40px',
            }}
          >
            알코올 처리 추정
          </span>

          {/* 처리 추정 시간 — 큰 숫자 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '16px',
              lineHeight: 1,
            }}
          >
            {props.processHours > 0 && (
              <span
                style={{
                  fontSize: '72px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.35)',
                  paddingBottom: '24px',
                }}
              >
                약
              </span>
            )}
            <span
              style={{
                fontSize: '220px',
                fontWeight: 900,
                color: C_WHITE,
                fontVariantNumeric: 'tabular-nums',
                fontFeatureSettings: '"tnum"',
                letterSpacing: '0',
                lineHeight: 0.9,
              }}
            >
              {mainHours}
            </span>
            <span
              style={{
                fontSize: '88px',
                fontWeight: 700,
                color: accentColor,
                paddingBottom: '16px',
              }}
            >
              시간
            </span>
          </div>

          {/* 예보 한 줄 요약 */}
          <div
            style={{
              marginTop: '40px',
              padding: '20px 56px',
              borderRadius: '12px',
              border: `1px solid rgba(255,255,255,0.12)`,
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            <span
              style={{
                fontSize: '44px',
                color: `rgba(255,255,255,0.65)`,
                fontWeight: 500,
                letterSpacing: '0',
              }}
            >
              {forecastSummary}
            </span>
          </div>

          {/* 티어 뱃지 */}
          <div
            style={{
              marginTop: '56px',
              padding: '22px 64px',
              borderRadius: '999px',
              background: badgeBg,
              border: badgeBorder,
            }}
          >
            <span
              style={{
                fontSize: '52px',
                fontWeight: 700,
                color: badgeTextColor,
                letterSpacing: '0',
              }}
            >
              {props.cardLine}
            </span>
          </div>
        </div>

        {/* 구분선 */}
        <div
          style={{
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
            margin: '56px 0 48px',
          }}
        />

        {/* ── 보조 수치 ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'flex-start',
          }}
        >
          {[
            { label: '순수 알코올', value: `${props.alcoholG.toFixed(0)}g` },
            { label: '소주 환산', value: `${props.sojuEquivBottles.toFixed(1)}병` },
            { label: '열량', value: `${props.kcal}kcal` },
          ].map((item, idx, arr) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontSize: '64px',
                    fontWeight: 800,
                    color: C_WHITE,
                    fontVariantNumeric: 'tabular-nums',
                    fontFeatureSettings: '"tnum"',
                    lineHeight: 1,
                  }}
                >
                  {item.value}
                </span>
                <span style={{ fontSize: '34px', color: `rgba(200,242,108,0.5)`, fontWeight: 500 }}>
                  {item.label}
                </span>
              </div>
              {idx < arr.length - 1 && (
                <div
                  style={{
                    width: '1px',
                    height: '80px',
                    background: 'rgba(255,255,255,0.1)',
                    margin: '0 40px',
                    alignSelf: 'center',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── 안전 안내 ── */}
        <div style={{ marginTop: 'auto', paddingTop: '56px', textAlign: 'center' }}>
          <span
            style={{
              fontSize: '32px',
              color: 'rgba(255,255,255,0.3)',
              fontWeight: 400,
            }}
          >
            {props.safetyLine}
          </span>
        </div>
      </div>
    </div>
  )
}
