'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import { Room } from '@/types'
import { parseImages } from '@/lib/parse'
import { useLanguage } from '@/lib/LanguageContext'
import { getLocalizedValue } from '@/lib/localize'

interface BookingButtonProps {
  rooms: Room[]
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

// Booking.com button that opens a house picker dialog with previews
export function BookingButton({ rooms, className, size = 'lg' }: BookingButtonProps) {
  const { t, lang } = useLanguage()
  const [open, setOpen] = useState(false)
  const bookableRooms = rooms.filter((r) => r.bookingUrl)

  return (
    <>
      <Button size={size} onClick={() => setOpen(true)} className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/booking-logo.svg" alt="" className="w-5 h-5 rounded" />
        Booking.com
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[620px] bg-[#F7E9D7]">
          <DialogHeader>
            <DialogTitle>{t.booking.title}</DialogTitle>
            <DialogDescription>{t.booking.subtitle}</DialogDescription>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-4">
            {bookableRooms.map((room) => {
              const name = getLocalizedValue(room.name, lang, room.name)
              const image = parseImages(room.images)[0] || '/images/hero-bg.jpg'
              return (
                <a
                  key={room.id}
                  href={room.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="group block overflow-hidden rounded-xl border-2 border-transparent hover:border-[#003580] transition-all hover:shadow-xl bg-white"
                >
                  <div className="relative h-36">
                    <Image
                      src={image}
                      alt={name}
                      fill
                      sizes="(max-width: 640px) 100vw, 280px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-1">{name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#003580] text-white border-0 text-xs">
                        {room.price} {t.hero.perNight}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {room.capacity}
                      </Badge>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
