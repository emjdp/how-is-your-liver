'use client'

import { useState } from 'react'
import Image from 'next/image'

interface MascotProps {
  size?: number
  className?: string
  alt?: string
}

export function Mascot({ size = 48, className, alt = '' }: MascotProps) {
  const [hidden, setHidden] = useState(false)

  if (hidden) return null

  return (
    <Image
      src="/brand/mascot-main.png"
      width={size}
      height={size}
      alt={alt}
      className={className}
      onError={() => setHidden(true)}
      style={{ objectFit: 'contain' }}
    />
  )
}
