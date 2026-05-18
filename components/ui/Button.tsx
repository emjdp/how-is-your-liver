'use client'

import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'h-14 w-full rounded-2xl text-[0.9375rem] font-semibold transition-colors duration-200 disabled:opacity-40 active:scale-[0.98] transition-transform'

  const styles =
    variant === 'primary'
      ? {
          background: 'var(--color-deep-green)',
          color: 'var(--color-lime)',
        }
      : {
          background: 'transparent',
          color: 'var(--color-ink)',
          border: '1px solid var(--color-glass-stroke)',
        }

  return (
    <button className={`${base} ${className}`} style={styles} {...props}>
      {children}
    </button>
  )
}
