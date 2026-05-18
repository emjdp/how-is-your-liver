import type { WeekCardProps } from '@/data/cardTemplates'
import { isHighTier } from '@/lib/tiers'

/* ─── 고정 색상 (html-to-image 캡처 안정성을 위해 CSS 변수 대신 하드코딩) ─── */
const C_WHITE = '#FFFFFF'
const C_LIME = '#C8F26C'
const C_WARN = '#D9342B'
const C_BG_TOP = '#0B3020'
const C_BG_BOT = '#060C08'

function formatRangeLabel(start: string, end: string): string {
  const fmtShort = (dateStr: string): string => {
    const parts = dateStr.split('-')
    if (parts.length !== 3) return dateStr
    const [, m, d] = parts
    const dayIdx = new Date(`${dateStr}T12:00:00`).getDay()
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return `${parseInt(m)}/${parseInt(d)} ${days[dayIdx]}`
  }
  const fmtYear = (dateStr: string): string => {
    const parts = dateStr.split('-')
    return parts.length === 3 ? parts[0] : ''
  }
  return `${fmtYear(start)}  ${fmtShort(start)} — ${fmtShort(end)}`
}

interface LedgerRowProps {
  label: string
  value: string
  accent?: boolean
  accentColor?: string
}

function LedgerRow({ label, value, accent, accentColor }: LedgerRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '32px 0',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <span
        style={{
          fontSize: '40px',
          color: 'rgba(255,255,255,0.42)',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: accent ? '54px' : '48px',
          fontWeight: 700,
          color: accent && accentColor ? accentColor : C_WHITE,
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {value}
      </span>
    </div>
  )
}

export function TplWeekly({ props }: { props: WeekCardProps }) {
  const isHigh = isHighTier(props.tierId)

  const accentColor = isHigh ? C_WARN : C_LIME
  const badgeBg = isHigh ? 'transparent' : 'rgba(200,242,108,0.1)'
  const badgeBorder = isHigh ? `2px solid ${C_WARN}` : '1.5px solid rgba(200,242,108,0.28)'
  const badgeTextColor = isHigh ? C_WARN : C_LIME

  const rangeLabel = formatRangeLabel(props.rangeStart, props.rangeEnd)

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
        <filter id="noise-weekly">
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
          filter="url(#noise-weekly)"
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
              }}
            >
              주간 정산
            </span>
          </div>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span
            style={{
              fontSize: '34px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            당신의 간은 안녕하십니까?
          </span>
        </div>

        {/* 기간 */}
        <div style={{ marginTop: '36px' }}>
          <span
            style={{
              fontSize: '42px',
              fontWeight: 500,
              color: `rgba(200,242,108,0.55)`,
            }}
          >
            {rangeLabel}
          </span>
        </div>

        {/* 구분선 */}
        <div
          style={{
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
            margin: '56px 0 0',
          }}
        />

        {/* ── 메인 히어로: 총 알코올 g ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '80px',
            paddingBottom: '80px',
          }}
        >
          <span
            style={{
              fontSize: '36px',
              color: `rgba(200,242,108,0.45)`,
              fontWeight: 500,
              marginBottom: '32px',
            }}
          >
            최근 7일 합산 순수 알코올
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '16px',
              lineHeight: 1,
            }}
          >
            <span
              style={{
                fontSize: '200px',
                fontWeight: 900,
                color: props.drinkingDays === 0 ? 'rgba(255,255,255,0.45)' : C_WHITE,
                fontVariantNumeric: 'tabular-nums',
                fontFeatureSettings: '"tnum"',
                lineHeight: 0.9,
              }}
            >
              {props.totalAlcoholG.toFixed(0)}
            </span>
            <span
              style={{
                fontSize: '88px',
                fontWeight: 700,
                color: accentColor,
                paddingBottom: '12px',
              }}
            >
              g
            </span>
          </div>

          {/* 티어 뱃지 */}
          <div
            style={{
              marginTop: '48px',
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
              }}
            >
              {props.cardLine}
            </span>
          </div>
        </div>

        {/* ── 정산 항목 (회계 장부 스타일) ── */}
        <div style={{ flex: 1 }}>
          <LedgerRow
            label="음주일"
            value={props.drinkingDays === 0 ? '0일' : `${props.drinkingDays}일`}
          />
          <LedgerRow
            label="소주 환산"
            value={`${props.totalSojuEquivBottles.toFixed(1)}병`}
          />
          <LedgerRow
            label="최고 음주일"
            value={props.peakDayLabel}
          />
          <LedgerRow
            label="평가"
            value={props.tierName}
            accent
            accentColor={accentColor}
          />
        </div>

        {/* ── 안전 안내 ── */}
        <div style={{ marginTop: 'auto', paddingTop: '48px', textAlign: 'center' }}>
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
