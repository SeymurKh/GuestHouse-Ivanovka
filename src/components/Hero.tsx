'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trees, Home, Users } from 'lucide-react'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'
import { RoomImage, Room } from '@/types'
import { useLanguage } from '@/lib/LanguageContext'
import { getLocalizedValue } from '@/lib/localize'

interface HeroProps {
  phone: string
  allRoomImages: RoomImage[]
  currentSlide: number
  setCurrentSlide: (index: number) => void
  rooms: Room[]
  onRoomClick?: (room: Room) => void
}

export function Hero({ phone, allRoomImages, currentSlide, setCurrentSlide, rooms }: HeroProps) {
  const { t, lang } = useLanguage()

  // Booking link of the room shown in the current slide
  const currentBookingUrl = rooms.find(
    (r) => r.id === allRoomImages[currentSlide]?.roomId
  )?.bookingUrl

  return (
    <section className="relative z-10 min-h-screen flex items-start lg:items-center pt-20 pb-8">
      <div className="container mx-auto px-4 h-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center min-h-[calc(100vh-8rem)]">
          {/* Left Side - Welcome Text */}
          <div className="space-y-6 lg:space-y-8">
            <Badge className="bg-[#cccbca]/20 text-[#cccbca] border-[#cccbca]/30">
              <Trees className="w-3 h-3 mr-1" />
              {t.hero.location}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[#b8ad9a]">
              {t.hero.title1}<br />
              <span>{t.hero.title2}</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-white/90 max-w-lg">
              {t.hero.subtitle}
            </p>
            <p className="hidden sm:block text-base md:text-lg text-[#cccbca] max-w-lg">
              {t.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2 sm:mt-0">
              <Button asChild size="lg" className="gap-2 bg-primary hover:bg-primary/90 px-8">
                <a href="#rooms">
                  <Home className="w-5 h-5" />
                  {t.hero.btnRooms}
                </a>
              </Button>
              <Button asChild size="lg" className="gap-2 bg-[#F7E9D7] hover:bg-[#E8D5BF] text-[#402713] px-8">
                <a href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="w-5 h-5" />
                  {t.hero.btnBook}
                </a>
              </Button>
              {currentBookingUrl && (
                <Button asChild size="lg" className="gap-2 bg-[#003580] hover:bg-[#002a66] text-white px-8">
                  <a href={currentBookingUrl} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/booking-logo.svg" alt="Booking.com" className="w-5 h-5 rounded" />
                    Booking.com
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Right Side - Sliding Images */}
          <div className="relative h-[150px] sm:h-[400px] md:h-[450px] lg:h-[500px] mt-auto lg:mt-0">
            <div className="absolute inset-0 flex items-center justify-center">
              {allRoomImages.map((item, idx) => {
                const roomData = rooms.find(r => r.id === item.roomId)
                const roomName = roomData ? getLocalizedValue(roomData.name, lang, item.roomName) : item.roomName

                return (
                  <div
                    key={`${item.roomId}-${idx}`}
                    className={`absolute w-full max-w-md transition-all duration-1000 ease-in-out ${
                      idx === currentSlide
                        ? 'opacity-100 translate-x-0 scale-100'
                        : idx < currentSlide
                          ? 'opacity-0 -translate-x-full scale-95'
                          : 'opacity-0 translate-x-full scale-95'
                    }`}
                  >
                    <div
                      className="overflow-hidden rounded-2xl shadow-2xl transition-all duration-300"
                    >
                      <div className="relative h-36 sm:h-64">
                        <Image
                          src={item.image || '/images/hero-bg.jpg'}
                          alt={roomName}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 448px"
                          className="object-cover"
                          priority={idx === 0}
                          loading={idx === 0 ? "eager" : "lazy"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white text-lg sm:text-xl font-semibold mb-1">{roomName}</h3>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary text-white border-0">{item.price} {t.hero.perNight}</Badge>
                            <Badge variant="secondary" className="bg-white/20 text-white border-0">
                              <Users className="w-3 h-3 mr-1" />
                              {item.capacity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 hidden sm:flex gap-2 flex-wrap justify-center max-w-[200px]">
              {allRoomImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentSlide ? 'bg-primary w-6' : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
