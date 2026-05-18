import type { CardProps } from '@/data/cardTemplates'
import { isHighTier } from '@/lib/tiers'

/* ─── 고정 색상 (html-to-image 캡처 안정성을 위해 CSS 변수 대신 하드코딩) ─── */
const C_WHITE = '#FFFFFF'
const C_LIME = '#C8F26C'
const C_WARN = '#D9342B'
const C_BG_TOP = '#0A2E1E'
const C_BG_BOT = '#070E0B'

function formatCardDate(dateStr: string): string {
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const [y, m, d] = parts
  const dayIdx = new Date(`${dateStr}T12:00:00`).getDay()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${y}.${m}.${d} ${days[dayIdx]}`
}

interface StatRowProps {
  label: string
  value: string
  accent?: boolean
  accentColor?: string
}

function StatRow({ label, value, accent, accentColor }: StatRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '36px 0',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span
        style={{
          fontSize: '40px',
          color: `rgba(255,255,255,0.45)`,
          fontWeight: 500,
          letterSpacing: '0',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: accent ? '56px' : '52px',
          fontWeight: 700,
          color: accent && accentColor ? accentColor : C_WHITE,
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"',
          letterSpacing: '0',
        }}
      >
        {value}
      </span>
    </div>
  )
}

export function TplOvertime({ props }: { props: CardProps }) {
  const isHigh = isHighTier(props.tierId)

  const accentColor = isHigh ? C_WARN : C_LIME
  const badgeBg = isHigh ? 'transparent' : 'rgba(200,242,108,0.1)'
  const badgeBorder = isHigh ? `2px solid ${C_WARN}` : '1.5px solid rgba(200,242,108,0.28)'
  const badgeTextColor = isHigh ? C_WARN : C_LIME

  const mainHours =
    props.processHours === 0 ? '0' : `${props.processHours}`
  const mainUnit = '시간'

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
      {/* 배경 그라데이션 레이어 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(170deg, ${C_BG_TOP} 0%, ${C_BG_BOT} 100%)`,
          filter: isHigh ? 'saturate(0.8) brightness(0.9)' : undefined,
        }}
      />

      {/* SVG 노이즈 텍스처 (feTurbulence) */}
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
        <filter id="noise-overtime">
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
          filter="url(#noise-overtime)"
          opacity="0.06"
        />
      </svg>

      {/* 콘텐츠 (세이프 영역: top 120px, bottom 200px, sides 70px) */}
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
        {/* ── 헤더 (사원증/보고서 스타일) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div
            style={{
              padding: '14px 36px',
              borderRadius: '12px',
              border: `2px solid ${accentColor}`,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: '34px',
                fontWeight: 700,
                color: accentColor,
                letterSpacing: '0',
              }}
            >
              간 야근 확인서
            </span>
          </div>
          <div
            style={{
              flex: 1,
              height: '2px',
              background: `rgba(200,242,108,0.15)`,
            }}
          />
        </div>

        {/* 날짜 + 소속 */}
        <div style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span
            style={{
              fontSize: '40px',
              color: `rgba(255,255,255,0.45)`,
              fontWeight: 500,
              letterSpacing: '0',
            }}
          >
            기준일: {formatCardDate(props.date)}
          </span>
          <span
            style={{
              fontSize: '36px',
              color: `rgba(200,242,108,0.4)`,
              fontWeight: 400,
              letterSpacing: '0',
            }}
          >
            소속: 당신의 간 / 당직 야근팀
          </span>
        </div>

        {/* 가로 구분선 */}
        <div
          style={{
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
            margin: '56px 0 0',
          }}
        />

        {/* ── 메인 히어로 (처리 추정 시간) ── */}
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
          <span
            style={{
              fontSize: '36px',
              color: `rgba(200,242,108,0.45)`,
              letterSpacing: '0',
              fontWeight: 500,
              textTransform: 'uppercase' as const,
              marginBottom: '40px',
            }}
          >
            알코올 처리 잔여
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
                  fontSize: '80px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                  paddingBottom: '28px',
                }}
              >
                약
              </span>
            )}
            <span
              style={{
                fontSize: '240px',
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
                fontSize: '90px',
                fontWeight: 700,
                color: accentColor,
                paddingBottom: '16px',
              }}
            >
              {mainUnit}
            </span>
          </div>

          <span
            style={{
              marginTop: '24px',
              fontSize: '40px',
              color: `rgba(255,255,255,0.38)`,
              fontWeight: 400,
              letterSpacing: '0',
            }}
          >
            알코올 처리 추정 시간
          </span>

          {/* 티어 뱃지 (cardLine) */}
          <div
            style={{
              marginTop: '64px',
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

        {/* ── 보조 수치 목록 (근무표 스타일) ── */}
        <div style={{ marginTop: '0' }}>
          <StatRow
            label="소주 환산"
            value={`${props.sojuEquivBottles.toFixed(1)}병`}
          />
          <StatRow
            label="순수 알코올"
            value={`${props.alcoholG.toFixed(0)}g`}
          />
          <StatRow
            label="티어"
            value={props.tierName}
            accent
            accentColor={accentColor}
          />
        </div>

        {/* ── 안전 안내 (safetyLineCard ≤32자) ── */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '48px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '32px',
              color: 'rgba(255,255,255,0.3)',
              fontWeight: 400,
              letterSpacing: '0',
            }}
          >
            {props.safetyLine}
          </span>
        </div>
      </div>
    </div>
  )
}
