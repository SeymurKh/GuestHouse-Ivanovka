'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Trash2, Upload, Loader2 } from 'lucide-react'
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
      <Label className="flex items-center gap-2 mb-2">
        Изображения
        <Badge variant="secondary">{images.length}</Badge>
      </Label>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {images.map((img: string, i: number) => (
          <div key={i} className="relative group aspect-video rounded overflow-hidden border bg-muted">
            <Image src={img} alt={`Фото ${i + 1}`} fill sizes="150px" className="object-cover" />
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
