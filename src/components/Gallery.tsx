'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

// Photos visible in the grid; the rest open in the lightbox via the "+N" tile
const TEASER_COUNT = 14

// Varied tile spans for a masonry-like grid (grid-flow-dense fills the gaps)
function spanFor(i: number): string {
  if (i % 7 === 0) return 'col-span-2 row-span-2'
  if (i % 5 === 3) return 'row-span-2'
  if (i % 3 === 2) return 'col-span-2'
  return ''
}

interface GalleryProps {
  images: string[]
}

export function Gallery({ images }: GalleryProps) {
  const { t } = useLanguage()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const lightboxOpen = lightboxIndex !== null

  const galleryImages = images

  const showNext = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null) return null
      if (galleryImages.length === 0) return null
      return (i + 1) % galleryImages.length
    })
  }, [galleryImages.length])

  const showPrev = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null) return null
      if (galleryImages.length === 0) return null
      return (i - 1 + galleryImages.length) % galleryImages.length
    })
  }, [galleryImages.length])

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') showNext()
      if (e.key === 'ArrowLeft') showPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, showNext, showPrev])

  if (galleryImages.length === 0) {
    return (
      <section id="gallery" className="relative z-10 min-h-screen flex items-center py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8" data-reveal>
            <Badge className="mb-4">{t.gallery.badge}</Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-[#b8ad9a]">{t.gallery.title}</h2>
            <p className="text-white/70 max-w-2xl mx-auto text-sm md:text-base">
              {t.gallery.description}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="gallery" className="relative z-10 min-h-screen flex items-center py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8" data-reveal>
          <Badge className="mb-4">{t.gallery.badge}</Badge>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-[#b8ad9a]">{t.gallery.title}</h2>
          <p className="text-white/70 max-w-2xl mx-auto text-sm md:text-base">
            {t.gallery.description}
          </p>
        </div>

        {/* Masonry-like grid: first photos visible, last tile shows "+N" — click opens the lightbox */}
        <div className="grid grid-cols-2 md:grid-cols-4 grid-flow-dense auto-rows-[140px] md:auto-rows-[180px] gap-3 max-w-5xl mx-auto" data-reveal>
          {galleryImages.slice(0, TEASER_COUNT).map((src, i) => {
            const remaining = galleryImages.length - TEASER_COUNT
            const showMore = i === TEASER_COUNT - 1 && remaining > 0
            return (
              <button
                key={src}
                onClick={() => setLightboxIndex(i)}
                className={`relative overflow-hidden rounded-xl group cursor-pointer ${spanFor(i)}`}
                aria-label={`${t.gallery.title} — ${i + 1}`}
              >
                <Image
                  src={src}
                  alt={`${t.gallery.title} — ${i + 1}`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {showMore ? (
                  <div className="absolute inset-0 bg-black/55 group-hover:bg-black/70 transition-colors flex flex-col items-center justify-center text-white">
                    <ZoomIn className="w-6 h-6 mb-1" />
                    <span className="text-2xl font-bold leading-none">+{remaining}</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={(o) => { if (!o) setLightboxIndex(null) }}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-[80vw] bg-black/90 border-white/10 p-2 sm:p-4">
          <DialogTitle className="sr-only">{t.gallery.title}</DialogTitle>
          <DialogDescription className="sr-only">{t.gallery.description}</DialogDescription>
          {lightboxIndex !== null && lightboxIndex < galleryImages.length && (
            <div className="relative w-full h-[70vh] sm:h-[80vh]">
              <Image
                src={galleryImages[lightboxIndex]}
                alt={`${t.gallery.title} — ${lightboxIndex + 1}`}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />

              {/* Prev / Next */}
              <button
                onClick={showPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={showNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Counter */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                {lightboxIndex + 1} / {galleryImages.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}