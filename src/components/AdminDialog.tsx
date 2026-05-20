'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Home } from 'lucide-react'
import { Room } from '@/types'
import { RoomEditor } from './admin/RoomEditor'
import { ReviewManager } from './admin/ReviewManager'

interface AdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isAdmin: boolean
  adminToken?: string | null
  adminPassword: string
  setAdminPassword: (password: string) => void
  onLogin: () => void
  rooms: Room[]
  onRoomUpdate: (room: Room) => void
  onRoomCreate: (room: Room) => void
  onRoomDelete?: (roomId: string) => void
  onReviewsUpdate?: () => void
}

// Tab type
type AdminTab = 'rooms' | 'reviews'

export function AdminDialog({
  open,
  onOpenChange,
  isAdmin,
  adminToken,
  adminPassword,
  setAdminPassword,
  onLogin,
  rooms,
  onRoomUpdate,
  onRoomCreate,
  onRoomDelete,
  onReviewsUpdate,
}: AdminDialogProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<AdminTab>('rooms')

  const authHeaders: Record<string, string> | undefined = adminToken ? { 'x-admin-token': adminToken } : undefined

  // Main tab button style
  const mainTabClass = (tab: AdminTab) => `
    flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
    ${activeTab === tab
      ? 'bg-primary text-white'
      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
    }
  `

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        {!isAdmin ? (
          <>
            <DialogHeader>
              <DialogTitle>Админ-панель</DialogTitle>
              <DialogDescription>Введите пароль для доступа</DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Пароль"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onLogin()}
              />
              <Button onClick={onLogin}>Войти</Button>
            </div>
            <p className="text-xs text-muted-foreground">Введите пароль администратора</p>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Админ-панель</DialogTitle>
              <DialogDescription>Управление контентом сайта</DialogDescription>
            </DialogHeader>

            {/* Main Tabs */}
            <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('rooms')}
                className={mainTabClass('rooms')}
              >
                <Home className="w-4 h-4" />
                Домики
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={mainTabClass('reviews')}
              >
                <MessageSquare className="w-4 h-4" />
                Отзывы
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'rooms' && (
              <RoomEditor
                rooms={rooms}
                authHeaders={authHeaders}
                onRoomUpdate={onRoomUpdate}
                onRoomCreate={onRoomCreate}
                onRoomDelete={onRoomDelete}
              />
            )}

            {activeTab === 'reviews' && (
              <ReviewManager
                open={open && activeTab === 'reviews'}
                isAdmin={isAdmin}
                authHeaders={authHeaders}
                onReviewsUpdate={onReviewsUpdate}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
