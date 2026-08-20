'use client'

// Ivanovka Guest Houses - Landing Page (Refactored)
import { useState, useEffect } from 'react'
import { Mountain } from 'lucide-react'

// Components
import {
  Header,
  Hero,
  Rooms,
  Gallery,
  Contact,
  Footer,
  RoomModal,
  AdminDialog,
  ScrollIndicator
} from '@/components'
import { BackgroundSlideshow } from '@/components/BackgroundSlideshow'

// Hooks
import { useToast } from '@/hooks/use-toast'
import { useSiteData } from '@/hooks/use-site-data'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'

// Types
import { Room } from '@/types'

// Utils
import { useLanguage } from '@/lib/LanguageContext'

export default function GuestHouseLanding() {
  const { t } = useLanguage()
  const { toast } = useToast()

  // Data hook — rooms, reviews, phone, loading
  const {
    rooms,
    setRooms,
    reviews,
    phone,
    email,
    address,
    gallery,
    loading,
    allRoomImages,
    refreshReviews,
    refreshSettings,
    refreshGallery,
  } = useSiteData()

  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Room detail modal state
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [roomModalOpen, setRoomModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Admin state
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [adminToken, setAdminToken] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentReview, setCurrentReview] = useState(0)

  // Reveal-on-scroll animations (activates after content loads)
  useScrollReveal(!loading)

  // Auto-slide effect for hero
  useEffect(() => {
    if (allRoomImages.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % allRoomImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [allRoomImages.length])

  // Auto-slide effect for reviews
  useEffect(() => {
    if (reviews.length === 0) return
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [reviews.length])

  // Secret admin access via keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.key === 'Ф' || e.key === 'ф')) {
        setAdminOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Admin login - server-side password verification
  const handleAdminLogin = async () => {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      })
      const data = await res.json()

      if (data.success && typeof data.token === 'string' && data.token.length > 0) {
        setIsAdmin(true)
        setAdminToken(data.token)
        toast({
          title: 'Success',
          description: 'Admin access granted',
          duration: 2000,
        })
      } else {
        setIsAdmin(false)
        setAdminToken(null)
        toast({
          title: 'Error',
          description: data.error || t.admin.wrongPassword,
          variant: 'destructive',
          duration: 3000,
        })
      }
    } catch {
      setIsAdmin(false)
      setAdminToken(null)
      toast({
        title: 'Error',
        description: 'Authorization error',
        variant: 'destructive',
        duration: 3000,
      })
    }
  }

  // Open room detail modal
  const openRoomModal = (room: Room) => {
    setSelectedRoom(room)
    setCurrentImageIndex(0)
    setRoomModalOpen(true)
  }

  // Handle room update from admin
  const handleRoomUpdate = (updatedRoom: Room) => {
    setRooms(rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r))
  }

  // Handle room creation from admin
  const handleRoomCreate = (newRoom: Room) => {
    setRooms([...rooms, newRoom])
  }

  // Handle room deletion from admin
  const handleRoomDelete = (roomId: string) => {
    setRooms(rooms.filter(r => r.id !== roomId))
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Mountain className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-white/70">{t.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative">
      {/* Fixed background slideshow (photos from content/bckgrnd) */}
      <BackgroundSlideshow />
      {/* Continuous page-wide gradient overlay — no seams between sections */}
      <div aria-hidden className="absolute inset-0 z-0 bg-[#261A0B]/75 pointer-events-none" />

      {/* Header */}
      <Header
        phone={phone}
        rooms={rooms}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Hero Section */}
      <Hero
        phone={phone}
        allRoomImages={allRoomImages}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        rooms={rooms}
        onRoomClick={openRoomModal}
      />

      {/* Rooms Section */}
      <Rooms
        rooms={rooms}
        onRoomClick={openRoomModal}
      />

      {/* Gallery Section */}
      <Gallery images={gallery} />

      {/* Contact Section */}
      <Contact
        phone={phone}
        email={email}
        address={address}
        reviews={reviews}
        currentReview={currentReview}
        setCurrentReview={setCurrentReview}
      />

      {/* Footer */}
      <Footer />

      {/* Room Detail Modal */}
      <RoomModal
        room={selectedRoom}
        open={roomModalOpen}
        onOpenChange={setRoomModalOpen}
        phone={phone}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
      />

      {/* Admin Dialog */}
      <AdminDialog
        open={adminOpen}
        onOpenChange={setAdminOpen}
        isAdmin={isAdmin}
        adminToken={adminToken}
        adminPassword={adminPassword}
        setAdminPassword={setAdminPassword}
        onLogin={handleAdminLogin}
        rooms={rooms}
        onRoomUpdate={handleRoomUpdate}
        onRoomCreate={handleRoomCreate}
        onRoomDelete={handleRoomDelete}
        onReviewsUpdate={refreshReviews}
        onSettingsSaved={refreshSettings}
        onGalleryUpdate={refreshGallery}
      />

      {/* Dynamic Scroll Indicator */}
      <ScrollIndicator />
    </div>
  )
}
