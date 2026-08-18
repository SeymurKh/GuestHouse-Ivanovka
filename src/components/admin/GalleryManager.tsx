'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, Trash2, GripVertical } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { GalleryImage } from '@/types'

interface GalleryManagerProps {
  authHeaders?: Record<string, string>
  onGalleryUpdate?: () => void
}

export function GalleryManager({ authHeaders, onGalleryUpdate }: GalleryManagerProps) {
  const { toast } = useToast()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileInputKey, setFileInputKey] = useState(0)

  // Drag & drop reorder state
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const loadGallery = async () => {
    try {
      const res = await fetch('/api/gallery')
      if (res.ok) {
        const data: GalleryImage[] = await res.json()
        if (Array.isArray(data)) setImages(data)
      }
    } catch {
      // Failed to load gallery
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadGallery()
  }, [])

  const uploadFile = async (file: File): Promise<string | null> => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        return data.url as string
      } else {
        const error = await res.json()
        toast({ title: 'Ошибка', description: error.error || 'Ошибка при загрузке', variant: 'destructive' })
        return null
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Ошибка при загрузке', variant: 'destructive' })
      return null
    } finally {
      setUploading(false)
    }
  }

  const addToGallery = async (url: string) => {
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authHeaders ?? {}) },
        body: JSON.stringify({ url }),
      })
      if (res.ok) {
        const created = await res.json()
        setImages((prev) => [...prev, created])
        onGalleryUpdate?.()
      } else {
        const error = await res.json()
        toast({ title: 'Ошибка', description: error.error || 'Не удалось добавить фото', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Ошибка при добавлении фото', variant: 'destructive' })
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const url = await uploadFile(file)
    if (url) {
      await addToGallery(url)
      await loadGallery()
    }
    setFileInputKey((prev) => prev + 1)
  }

  const deleteImage = async (id: string) => {
    if (!confirm('Удалить это фото из галереи?')) return

    try {
      const res = await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      })
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== id))
        onGalleryUpdate?.()
      } else {
        const error = await res.json()
        toast({ title: 'Ошибка', description: error.error || 'Не удалось удалить', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Ошибка при удалении', variant: 'destructive' })
    }
  }

  const moveImage = (from: number, to: number) => {
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setImages(next)
  }

  const handleDrop = (to: number) => {
    if (dragIndex !== null && dragIndex !== to) {
      moveImage(dragIndex, to)
    }
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const saveOrder = async () => {
    setSavingOrder(true)
    try {
      const items = images.map((img, index) => ({ id: img.id, sortOrder: index }))
      const res = await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(authHeaders ?? {}) },
        body: JSON.stringify({ items }),
      })

      if (res.ok) {
        const data: GalleryImage[] = await res.json()
        if (Array.isArray(data)) setImages(data)
        onGalleryUpdate?.()
        toast({ title: 'Сохранено', description: 'Порядок фото обновлён' })
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось сохранить порядок', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Ошибка при сохранении порядка', variant: 'destructive' })
    } finally {
      setSavingOrder(false)
    }
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Управление фотографиями галереи. Первое фото — обложка раздела.
        </p>
        <Button variant="outline" onClick={saveOrder} disabled={savingOrder || loading || images.length === 0}>
          {savingOrder ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GripVertical className="w-4 h-4 mr-2" />}
          Сохранить порядок
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragEnd={() => {
                setDragIndex(null)
                setDragOverIndex(null)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverIndex(i)
              }}
              onDrop={(e) => {
                e.preventDefault()
                handleDrop(i)
              }}
              className={`relative group aspect-video rounded overflow-hidden border bg-muted cursor-move transition-all ${
                dragIndex === i ? 'opacity-40 scale-95' : ''
              } ${
                dragOverIndex === i && dragIndex !== null && dragIndex !== i
                  ? 'ring-2 ring-primary scale-[1.03]'
                  : ''
              }`}
            >
              <Image
                src={img.url}
                alt={`Фото ${i + 1}`}
                fill
                sizes="150px"
                className="object-cover pointer-events-none"
              />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
                  Обложка
                </span>
              )}
              <GripVertical className="absolute bottom-1 left-1 w-4 h-4 text-white/90 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
              <button
                onClick={() => deleteImage(img.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && images.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Нет фотографий</p>
          <p className="text-sm">Добавьте первое фото в галерею</p>
        </div>
      )}

      <input
        key={fileInputKey}
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
        Добавить фото
      </Button>
    </div>
  )
}