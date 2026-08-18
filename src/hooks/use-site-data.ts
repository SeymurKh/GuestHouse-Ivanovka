'use client'

import { useState, useEffect, useMemo } from 'react'
import { Room, Review, RoomImage, GalleryImage } from '@/types'
import { parseImages } from '@/lib/parse'
import { demoRooms, demoReviews, demoSettings } from '@/lib/demo-data'
import { galleryImages as demoGalleryImages } from '@/lib/content-manifest'

interface SiteSettings {
  phone: string
  email: string
  address: string
  description: string
}

export function useSiteData() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [phone, setPhone] = useState('+994508080069')
  const [email, setEmail] = useState('roomcommunityofficial@gmail.com')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [gallery, setGallery] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Hero slider: 5 random photos from each room, shuffled together (10 total)
  const allRoomImages: RoomImage[] = useMemo(() => {
    const shuffled = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)

    const picked = rooms.flatMap((room) =>
      shuffled(parseImages(room.images)).slice(0, 5).map((img) => ({
        image: img,
        roomName: room.name,
        price: room.price,
        capacity: room.capacity,
        roomId: room.id,
      }))
    )
    return shuffled(picked)
  }, [rooms])

  // Initialize data
  useEffect(() => {
    async function loadData() {
      // Demo mode: use static data (for Vercel deployment without database)
      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        setRooms(demoRooms)
        setReviews(demoReviews)
        if (demoSettings.phone) setPhone(demoSettings.phone)
        if (demoSettings.email) setEmail(demoSettings.email)
        if (demoSettings.address) setAddress(demoSettings.address)
        if (demoSettings.description) setDescription(demoSettings.description)
        setGallery(demoGalleryImages)
        setLoading(false)
        return
      }

      try {
        const [roomsRes, reviewsRes, settingsRes, galleryRes] = await Promise.all([
          fetch('/api/rooms'),
          fetch('/api/reviews'),
          fetch('/api/settings'),
          fetch('/api/gallery'),
        ])

        if (roomsRes.ok) {
          const roomsData = await roomsRes.json()
          if (Array.isArray(roomsData)) setRooms(roomsData)
        }

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json()
          if (Array.isArray(reviewsData)) setReviews(reviewsData.slice(0, 5))
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          if (settingsData?.phone) setPhone(settingsData.phone)
          if (settingsData?.email) setEmail(settingsData.email)
          if (settingsData?.address) setAddress(settingsData.address || '')
          if (settingsData?.description) setDescription(settingsData.description || '')
        }

        if (galleryRes.ok) {
          const galleryData: GalleryImage[] = await galleryRes.json()
          if (Array.isArray(galleryData)) {
            setGallery(galleryData.map((g) => g.url))
          }
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
        if (Array.isArray(data)) setReviews(data.slice(0, 5))
      }
    } catch {
      // Failed to refresh reviews
    }
  }

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        if (data?.phone) setPhone(data.phone)
        if (data?.email) setEmail(data.email)
        setAddress(data?.address || '')
        setDescription(data?.description || '')
      }
    } catch {
      // Failed to refresh settings
    }
  }

  const refreshGallery = async () => {
    try {
      const res = await fetch('/api/gallery')
      if (res.ok) {
        const data: GalleryImage[] = await res.json()
        if (Array.isArray(data)) setGallery(data.map((g) => g.url))
      }
    } catch {
      // Failed to refresh gallery
    }
  }

  return {
    rooms,
    setRooms,
    reviews,
    setReviews,
    phone,
    email,
    address,
    description,
    gallery,
    loading,
    allRoomImages,
    refreshReviews,
    refreshSettings,
    refreshGallery,
  }
}

// Export Settings type for reuse
export type { SiteSettings }