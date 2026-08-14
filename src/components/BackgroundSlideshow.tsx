'use client'

import { useState, useEffect } from 'react'
import { bgImages } from '@/lib/content-manifest'

const INTERVAL_MS = 8000

// Fixed full-page background slideshow with crossfade
export function BackgroundSlideshow() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (bgImages.length <= 1) return
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % bgImages.length)
    }, INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  if (bgImages.length === 0) return null

  return (
    <div aria-hidden className="fixed -inset-5 z-0">
      {bgImages.map((src, idx) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: idx === active ? 1 : 0,
          }}
        />
      ))}
    </div>
  )
}
