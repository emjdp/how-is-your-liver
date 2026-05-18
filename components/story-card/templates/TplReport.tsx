import type { CardProps } from '@/data/cardTemplates'
import { isHighTier } from '@/lib/tiers'

/* ─── 고정 색상 (html-to-image 캡처 안정성을 위해 CSS 변수 대신 하드코딩) ─── */
const C_WHITE = '#FFFFFF'
const C_LIME = '#C8F26C'
const C_WARN = '#D9342B'
const C_BG_TOP = '#0F3D2E'
const C_BG_BOT = '#0A1610'

function formatCardDate(dateStr: string): string {
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const [y, m, d] = parts
  const dayIdx = new Date(`${dateStr}T12:00:00`).getDay()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${y}.${m}.${d} ${days[dayIdx]}`
}

interface MetricBlockProps {
  label: string
  value: string
}

function MetricBlock({ label, value }: MetricBlockProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <span
        style={{
          fontSize: '72px',
          fontWeight: 800,
          color: C_WHITE,
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"',
          lineHeight: 1,
          letterSpacing: '0',
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: '36px',
          color: `rgba(200,242,108,0.55)`,
          letterSpacing: '0',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
  )
}

export function TplReport({
  props,
  backgroundImage,
}: {
  props: CardProps
  backgroundImage?: string
}) {
  const isHigh = isHighTier(props.tierId)

  const accentColor = isHigh ? C_WARN : C_LIME
  const badgeBg = isHigh ? 'transparent' : 'rgba(200,242,108,0.1)'
  const badgeBorder = isHigh ? `2px solid ${C_WARN}` : '1.5px solid rgba(200,242,108,0.28)'
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
      {backgroundImage ? (
        <>
          {/* 사진 배경 (dataURL → cross-origin 문제 없음) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backgroundImage}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* 50~65% 어두운 오버레이 — 텍스트 대비 유지 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(170deg, rgba(11,20,17,0.58) 0%, rgba(11,20,17,0.65) 100%)',
            }}
          />
        </>
      ) : (
        /* 기존 그라데이션 배경 */
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(170deg, ${C_BG_TOP} 0%, ${C_BG_BOT} 100%)`,
            filter: isHigh ? 'saturate(0.8) brightness(0.9)' : undefined,
          }}
        />
      )}

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
        <filter id="noise-report">
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
          filter="url(#noise-report)"
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
        {/* ── 헤더 ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <span
            style={{
              fontSize: '48px',
              fontWeight: 800,
              color: C_WHITE,
              lineHeight: 1.1,
              letterSpacing: '0',
            }}
          >
            당신의 간은
          </span>
          <span
            style={{
              fontSize: '42px',
              fontWeight: 600,
              color: `rgba(200,242,108,0.75)`,
              lineHeight: 1.1,
            }}
          >
            안녕하십니까?
          </span>
        </div>

        {/* 날짜 */}
        <div style={{ marginTop: '24px' }}>
          <span
            style={{
              fontSize: '40px',
              color: `rgba(200,242,108,0.55)`,
              fontWeight: 500,
              letterSpacing: '0',
            }}
          >
            {formatCardDate(props.date)}
          </span>
        </div>

        {/* 가로 구분선 */}
        <div
          style={{
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
            margin: '56px 0 64px',
          }}
        />

        {/* ── 메인 히어로 (건강검진 결과 스타일) ── */}
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
          {/* 섹션 레이블 */}
          <span
            style={{
              fontSize: '36px',
              color: `rgba(200,242,108,0.45)`,
              letterSpacing: '0',
              fontWeight: 500,
              textTransform: 'uppercase' as const,
              marginBottom: '48px',
            }}
          >
            건강 검진 결과
          </span>

          {/* 소주 환산 — 큰 숫자 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '20px',
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
              {props.sojuEquivBottles.toFixed(1)}
            </span>
            <span
              style={{
                fontSize: '100px',
                fontWeight: 700,
                color: accentColor,
                paddingBottom: '20px',
              }}
            >
              병
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
            소주 환산
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

        {/* 가로 구분선 */}
        <div
          style={{
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
            margin: '64px 0 56px',
          }}
        />

        {/* ── 보조 수치 3종 ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'flex-start',
          }}
        >
          <MetricBlock
            label="순수 알코올"
            value={`${props.alcoholG.toFixed(0)}g`}
          />
          <div
            style={{
              width: '1px',
              background: 'rgba(255,255,255,0.1)',
              alignSelf: 'stretch',
            }}
          />
          <MetricBlock label="처리 추정" value={processHoursText} />
          <div
            style={{
              width: '1px',
              background: 'rgba(255,255,255,0.1)',
              alignSelf: 'stretch',
            }}
          />
          <MetricBlock label="열량" value={`${props.kcal}kcal`} />
        </div>

        {/* ── 안전 안내 (safetyLineCard ≤32자) ── */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '64px',
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
