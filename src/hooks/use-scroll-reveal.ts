'use client'

import { useEffect } from 'react'

// Reveal-on-scroll for elements with [data-reveal] — IntersectionObserver, no dependencies.
// `active` should become true when the page content has rendered (e.g. after loading).
export function useScrollReveal(active: boolean) {
  useEffect(() => {
    if (!active) return

    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [active])
}
