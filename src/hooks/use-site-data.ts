'use client'

import { useState, useEffect, useMemo } from 'react'
import { Room, Review, RoomImage } from '@/types'
import { parseImages } from '@/lib/parse'

export function useSiteData() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [phone, setPhone] = useState('+994 50 123 45 67')
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
    loading,
    allRoomImages,
    refreshReviews,
  }
}
