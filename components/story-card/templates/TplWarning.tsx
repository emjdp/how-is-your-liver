import type { DayCardProps } from '@/data/cardTemplates'
import { isHighTier } from '@/lib/tiers'

/* ─── 고정 색상 (html-to-image 캡처 안정성을 위해 CSS 변수 대신 하드코딩) ─── */
const C_WHITE = '#FFFFFF'
const C_LIME = '#C8F26C'
const C_WARN = '#D9342B'
const C_BG_TOP = '#0A2819'
const C_BG_BOT = '#060C08'

function formatCardDate(dateStr: string): string {
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const [y, m, d] = parts
  const dayIdx = new Date(`${dateStr}T12:00:00`).getDay()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${y}.${m}.${d} ${days[dayIdx]}`
}

/* 경고 삼각형 — 외곽선만, 면 채움 없음 */
function WarningTriangle({ color, size = 120 }: { color: string; size?: number }) {
  const s = size
  const half = s / 2
  const h = (Math.sqrt(3) / 2) * s
  const top = (s - h) / 2
  const pad = 8
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display: 'block' }}>
      <polygon
        points={`${half},${top + pad} ${pad},${top + h - pad} ${s - pad},${top + h - pad}`}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <text
        x={half}
        y={top + h * 0.68}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={Math.round(s * 0.28)}
        fontWeight="700"
        fill={color}
        fontFamily='"Pretendard Variable", Pretendard, sans-serif'
      >
        !
      </text>
    </svg>
  )
}

export function TplWarning({ props }: { props: DayCardProps }) {
  const isHigh = isHighTier(props.tierId)

  /* warn 컬러: 외곽선/작은 포인트만. 높은 티어라도 배경 채움 금지 */
  const triangleColor = isHigh ? C_WARN : `rgba(217,52,43,0.65)`
  const accentColor = isHigh ? C_WARN : C_LIME
  const badgeBorder = isHigh
    ? `2px solid ${C_WARN}`
    : '1.5px solid rgba(200,242,108,0.28)'
  const badgeTextColor = isHigh ? C_WARN : C_LIME

  const processHoursText =
    props.processHours === 0 ? '0시간' : `약 ${props.processHours}시간`

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
      {/* 배경 그라데이션 (높은 티어도 채도 낮춤, 배경 warn 채움 절대 없음) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(170deg, ${C_BG_TOP} 0%, ${C_BG_BOT} 100%)`,
          filter: isHigh ? 'saturate(0.8) brightness(0.9)' : undefined,
        }}
      />

      {/* warn 색 테두리 — 외곽 얇은 선 (면 채움 없음) */}
      <div
        style={{
          position: 'absolute',
          inset: '0',
          border: `3px solid ${isHigh ? 'rgba(217,52,43,0.35)' : 'rgba(217,52,43,0.15)'}`,
          pointerEvents: 'none',
          boxSizing: 'border-box',
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
        <filter id="noise-warning">
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
          filter="url(#noise-warning)"
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <WarningTriangle color={triangleColor} size={100} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span
              style={{
                fontSize: '48px',
                fontWeight: 800,
                color: C_WHITE,
                letterSpacing: '0',
                lineHeight: 1.1,
              }}
            >
              당신의 간은 안녕하십니까?
            </span>
            <span
              style={{
                fontSize: '36px',
                fontWeight: 500,
                color: `rgba(255,255,255,0.35)`,
                letterSpacing: '0',
              }}
            >
              {formatCardDate(props.date)}
            </span>
          </div>
        </div>

        {/* 구분선 */}
        <div
          style={{
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
            margin: '56px 0 64px',
          }}
        />

        {/* ── 메인 히어로: 알코올 g ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {/* 섹션 레이블 */}
          <span
            style={{
              fontSize: '36px',
              color: `rgba(200,242,108,0.45)`,
              fontWeight: 500,
              letterSpacing: '0',
              marginBottom: '48px',
            }}
          >
            오늘 섭취한 순수 알코올
          </span>

          {/* 큰 숫자: alcoholG */}
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
                fontSize: '240px',
                fontWeight: 900,
                color: C_WHITE,
                fontVariantNumeric: 'tabular-nums',
                fontFeatureSettings: '"tnum"',
                letterSpacing: '0',
                lineHeight: 0.9,
              }}
            >
              {props.alcoholG.toFixed(0)}
            </span>
            <span
              style={{
                fontSize: '100px',
                fontWeight: 700,
                color: accentColor,
                paddingBottom: '16px',
              }}
            >
              g
            </span>
          </div>

          {/* cardLine */}
          <div
            style={{
              marginTop: '64px',
              padding: '24px 72px',
              borderRadius: '999px',
              background: 'transparent',
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

          {/* safetyLine — 경고 카드이므로 중앙에 한 번 더 강조 */}
          <div
            style={{
              marginTop: '48px',
              padding: '20px 48px',
              borderRadius: '12px',
              border: `1px solid rgba(255,255,255,0.1)`,
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            <span
              style={{
                fontSize: '40px',
                fontWeight: 500,
                color: `rgba(255,255,255,0.55)`,
                letterSpacing: '0',
                textAlign: 'center' as const,
                display: 'block',
              }}
            >
              {props.safetyLine}
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
            { label: '소주 환산', value: `${props.sojuEquivBottles.toFixed(1)}병` },
            { label: '처리 추정', value: processHoursText },
            { label: '열량', value: `${props.kcal}kcal` },
          ].map((item, idx, arr) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center' }}>
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
                    margin: '0 32px',
                    alignSelf: 'center',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── 하단 안전 안내 ── */}
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
