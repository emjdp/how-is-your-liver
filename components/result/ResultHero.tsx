import type { TierResult } from '@/types/record'
import { isHighTier } from '@/lib/tiers'

interface ResultHeroProps {
  tier: TierResult
}

export function ResultHero({ tier }: ResultHeroProps) {
  const high = isHighTier(tier.id)

  const badgeStyle: React.CSSProperties = high
    ? {
        border: '1.5px solid var(--color-warn)',
        color: 'var(--color-warn)',
        background: 'transparent',
      }
    : tier.color === '--color-lime'
    ? {
        background: 'var(--color-lime)',
        color: 'var(--color-deep-green)',
      }
    : {
        background: `var(${tier.color})`,
        color: '#fff',
      }

  return (
    <div className="flex flex-col gap-3">
      <span
        className="self-start text-[0.75rem] font-semibold px-3 py-1 rounded-full"
        style={badgeStyle}
      >
        {tier.name}
      </span>
      <h1
        className="text-[2rem] font-bold leading-snug"
        style={{ color: 'var(--color-deep-green)' }}
      >
        {tier.headline}
      </h1>
      <p
        className="text-[0.9375rem] leading-relaxed"
        style={{ color: 'var(--color-muted)' }}
      >
        {tier.subline}
      </p>
      <p
        className="text-[0.875rem] leading-relaxed"
        style={{ color: high ? 'var(--color-warn)' : 'var(--color-muted)' }}
      >
        {tier.safetyLine}
      </p>
    </div>
  )
}
