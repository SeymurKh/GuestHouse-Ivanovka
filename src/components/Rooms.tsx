'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ArrowRight } from 'lucide-react'
import { Room } from '@/types'
import { parseImages, parseLocalizedAmenities } from '@/lib/parse'
import { useLanguage } from '@/lib/LanguageContext'
import { getLocalizedValue } from '@/lib/localize'
import { getAmenityIcon } from '@/lib/icons'

interface RoomsProps {
  rooms: Room[]
  onRoomClick: (room: Room) => void
}

export function Rooms({ rooms, onRoomClick }: RoomsProps) {
  const { t, lang } = useLanguage()
  
  return (
    <section id="rooms" className="relative z-10 min-h-screen flex items-center py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge className="mb-4">{t.rooms.badge}</Badge>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-[#b8ad9a]">{t.rooms.title}</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {rooms.slice(0, 2).map((room, index) => {
            const roomName = getLocalizedValue(room.name, lang, room.name)
            const roomDescription = getLocalizedValue(room.description, lang, '')
            const isFirstRoom = index === 0
            
            return (
              <Card 
                key={room.id} 
                className="overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 bg-[#F7E9D7] flex flex-col hover:scale-[1.02] py-0 gap-0"
                onClick={() => onRoomClick(room)}
              >
                {/* Image Section - Fixed Height */}
                <div className="relative h-48 sm:h-48 md:h-56 overflow-hidden flex-shrink-0">
                  <Image 
                    src={parseImages(room.images)[0] || '/images/hero-bg.jpg'} 
                    alt={roomName}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority={isFirstRoom}
                    loading={isFirstRoom ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center gap-1">
                      <Badge className="bg-[#F7E9D7] text-[#402713] text-xs">{room.price} {t.rooms.perNight}</Badge>
                      <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {t.rooms.upTo} {room.capacity} {t.rooms.guests}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Content Section - Flexible */}
                <div className="flex flex-col flex-1">
                  <CardHeader className="pb-1 pt-1 px-3 sm:px-4">
                    <CardTitle className="text-base md:text-xl">{roomName}</CardTitle>
                    <CardDescription className="line-clamp-1 text-sm hidden sm:block">{roomDescription}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between px-3 sm:px-4 pb-1 sm:pb-2">
                    <div className="flex flex-wrap gap-1">
                      {parseLocalizedAmenities(room.amenities, lang).slice(0, 2).map((amenity: string, i: number) => (
                        <Badge key={i} variant="secondary" className="flex items-center gap-1 text-xs">
                          {getAmenityIcon(amenity)}
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-primary font-medium mt-1 pt-1 border-t">
                      {t.rooms.details}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
