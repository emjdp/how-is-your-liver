interface GlassPanelProps {
  children: React.ReactNode
  className?: string
}

export function GlassPanel({ children, className = '' }: GlassPanelProps) {
  return (
    <div
      className={`rounded-[999px] p-2 ${className}`}
      style={{
        background: 'var(--color-glass)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        border: '1px solid var(--color-glass-stroke)',
      }}
    >
      {children}
    </div>
  )
}
