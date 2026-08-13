'use client'

import { useState, useEffect, useMemo } from 'react'
import { Room, Review, RoomImage } from '@/types'
import { parseImages } from '@/lib/parse'
import { demoRooms, demoReviews, demoSettings } from '@/lib/demo-data'

export function useSiteData() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [phone, setPhone] = useState('+994508080069')
  const [email, setEmail] = useState('roomcommunityofficial@gmail.com')
  const [loading, setLoading] = useState(true)

  // Collect ALL images from all rooms with room info
  const allRoomImages: RoomImage[] = useMemo(
    () =>
      rooms.flatMap((room) =>
        parseImages(room.images).map((img) => ({
          image: img,
          roomName: room.name,
          price: room.price,
          capacity: room.capacity,
          roomId: room.id,
        }))
      ),
    [rooms]
  )

  // Initialize data
  useEffect(() => {
    async function loadData() {
      // Demo mode: use static data (for Vercel deployment without database)
      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        setRooms(demoRooms)
        setReviews(demoReviews)
        if (demoSettings.phone) setPhone(demoSettings.phone)
        if (demoSettings.email) setEmail(demoSettings.email)
        setLoading(false)
        return
      }

      try {
        const [roomsRes, reviewsRes, settingsRes] = await Promise.all([
          fetch('/api/rooms'),
          fetch('/api/reviews'),
          fetch('/api/settings'),
        ])

        if (roomsRes.ok) {
          const roomsData = await roomsRes.json()
          setRooms(roomsData)
        }

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json()
          setReviews(reviewsData.slice(0, 5))
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          if (settingsData?.phone) setPhone(settingsData.phone)
          if (settingsData?.email) setEmail(settingsData.email)
        }
      } catch (error) {
        console.error('[Load Data Error]', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const refreshReviews = async () => {
    try {
      const res = await fetch('/api/reviews')
      if (res.ok) {
        const data = await res.json()
        setReviews(data.slice(0, 5))
      }
    } catch {
      // Failed to refresh reviews
    }
  }

  return {
    rooms,
    setRooms,
    reviews,
    setReviews,
    phone,
    email,
    loading,
    allRoomImages,
    refreshReviews,
  }
}
