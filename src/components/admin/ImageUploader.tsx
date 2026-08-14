'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Trash2, Upload, Loader2, GripVertical } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ImageUploaderProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  authHeaders?: Record<string, string>
  disabled?: boolean
}

export function ImageUploader({ images, onImagesChange, authHeaders, disabled }: ImageUploaderProps) {
  const { toast } = useToast()
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileInputKey, setFileInputKey] = useState(0)

  // Drag & drop reorder state
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const moveImage = (from: number, to: number) => {
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onImagesChange(next)
  }

  const handleDrop = (to: number) => {
    if (dragIndex !== null && dragIndex !== to) {
      moveImage(dragIndex, to)
    }
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        return data.url
      } else {
        const error = await res.json()
        toast({
          title: 'Ошибка',
          description: error.error || 'Ошибка при загрузке файла',
          variant: 'destructive',
        })
        return null
      }
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Ошибка при загрузке файла',
        variant: 'destructive',
      })
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const deleteFile = async (imageUrl: string): Promise<boolean> => {
    if (!imageUrl.startsWith('/uploads/')) {
      return true
    }

    try {
      const res = await fetch(`/api/upload?url=${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE',
        headers: authHeaders,
      })
      return res.ok
    } catch {
      return false
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const url = await uploadFile(file)
    if (url) {
      onImagesChange([...images, url])
    }

    setFileInputKey((prev) => prev + 1)
  }

  const triggerFileInput = () => {
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 0)
  }

  const removeImage = async (index: number) => {
    const imageToDelete = images[index]
    await deleteFile(imageToDelete)
    onImagesChange(images.filter((_, i) => i !== index))
  }

  return (
    <div>
      <Label className="flex items-center gap-2 mb-1">
        Изображения
        <Badge variant="secondary">{images.length}</Badge>
      </Label>
      <p className="text-xs text-muted-foreground mb-2">
        Перетаскивайте фото для изменения порядка. Первое фото — обложка.
      </p>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {images.map((img: string, i: number) => (
          <div
            key={img}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOverIndex(i)
            }}
            onDrop={(e) => {
              e.preventDefault()
              handleDrop(i)
            }}
            title="Перетащите для изменения порядка"
            className={`relative group aspect-video rounded overflow-hidden border bg-muted cursor-move transition-all ${
              dragIndex === i ? 'opacity-40 scale-95' : ''
            } ${dragOverIndex === i && dragIndex !== null && dragIndex !== i ? 'ring-2 ring-primary scale-[1.03]' : ''}`}
          >
            <Image
              src={img}
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
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <input
        key={fileInputKey}
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      <Button variant="outline" onClick={triggerFileInput} disabled={uploadingImage || disabled}>
        {uploadingImage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
        Добавить фото
      </Button>
    </div>
  )
}
