'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Loader2, Globe, Plus, Trash2 } from 'lucide-react'
import { Room } from '@/types'
import { parseImages, parseLocalizedAmenities } from '@/lib/parse'
import { parseLocalizedStringToForm, createLocalizedString, getLocalizedValue } from '@/lib/localize'
import { languages, Language } from '@/lib/i18n'
import { useToast } from '@/hooks/use-toast'
import { ImageUploader } from './ImageUploader'

// Localized field state
interface LocalizedField {
  ru: string
  az: string
  en: string
}

// Marker for "creating new room" mode
const CREATING_ID = 'new'

// Parse localized list field into comma-joined form values.
// Repairs legacy values where items were glued together with newlines.
const parseListToForm = (value: unknown): LocalizedField => {
  const result: LocalizedField = { ru: '', az: '', en: '' }
  for (const lang of ['ru', 'az', 'en'] as Language[]) {
    result[lang] = parseLocalizedAmenities(value, lang)
      .flatMap((item) => item.split('\n'))
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ')
  }
  return result
}

interface RoomEditorProps {
  rooms: Room[]
  authHeaders?: Record<string, string>
  onRoomUpdate: (room: Room) => void
  onRoomCreate: (room: Room) => void
  onRoomDelete?: (roomId: string) => void
}

export function RoomEditor({ rooms, authHeaders, onRoomUpdate, onRoomCreate, onRoomDelete }: RoomEditorProps) {
  const { toast } = useToast()

  // Room editing state — null = not editing, 'new' = creating, string = editing existing
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Localized fields
  const [editName, setEditName] = useState<LocalizedField>({ ru: '', az: '', en: '' })
  const [editDescription, setEditDescription] = useState<LocalizedField>({ ru: '', az: '', en: '' })
  const [editConditions, setEditConditions] = useState<LocalizedField>({ ru: '', az: '', en: '' })
  const [editAdvantages, setEditAdvantages] = useState<LocalizedField>({ ru: '', az: '', en: '' })
  const [editAmenities, setEditAmenities] = useState<LocalizedField>({ ru: '', az: '', en: '' })

  // Non-localized fields (raw strings — parsed on save, so typing isn't interrupted)
  const [editPrice, setEditPrice] = useState('')
  const [editCapacity, setEditCapacity] = useState('2')
  const [editImages, setEditImages] = useState<string[]>([])
  const [editBookingUrl, setEditBookingUrl] = useState('')

  // Current language tab
  const [editLang, setEditLang] = useState<Language>('ru')

  const isCreating = editId === CREATING_ID

  // Helper to update localized field
  const updateLocalizedField = (
    setter: (val: LocalizedField) => void,
    field: LocalizedField,
    lang: Language,
    value: string
  ) => {
    setter({ ...field, [lang]: value })
  }

  const startEditingRoom = (room: Room) => {
    setEditId(room.id)
    setEditName(parseLocalizedStringToForm(room.name))
    setEditPrice(String(room.price))
    setEditCapacity(String(room.capacity))
    setEditDescription(parseLocalizedStringToForm(room.description))
    setEditConditions(parseLocalizedStringToForm(room.conditions))
    setEditAdvantages(parseLocalizedStringToForm(room.advantages))
    setEditAmenities(parseListToForm(room.amenities))
    setEditImages(parseImages(room.images))
    setEditBookingUrl(room.bookingUrl || '')
    setEditLang('ru')
  }

  const startCreatingRoom = () => {
    setEditId(CREATING_ID)
    setEditName({ ru: '', az: '', en: '' })
    setEditPrice('')
    setEditCapacity('2')
    setEditDescription({ ru: '', az: '', en: '' })
    setEditConditions({ ru: '', az: '', en: '' })
    setEditAdvantages({ ru: '', az: '', en: '' })
    setEditAmenities({ ru: '', az: '', en: '' })
    setEditImages([])
    setEditBookingUrl('')
    setEditLang('ru')
  }

  const cancelEditing = () => {
    setEditId(null)
    setEditName({ ru: '', az: '', en: '' })
    setEditPrice('')
    setEditCapacity('2')
    setEditDescription({ ru: '', az: '', en: '' })
    setEditConditions({ ru: '', az: '', en: '' })
    setEditAdvantages({ ru: '', az: '', en: '' })
    setEditAmenities({ ru: '', az: '', en: '' })
    setEditImages([])
    setEditBookingUrl('')
  }

  // Build room data payload from form state
  const buildRoomData = () => {
    const advantagesArr = {
      ru: editAdvantages.ru.split('\n').map(s => s.trim()).filter(Boolean),
      az: editAdvantages.az.split('\n').map(s => s.trim()).filter(Boolean),
      en: editAdvantages.en.split('\n').map(s => s.trim()).filter(Boolean),
    }

    const amenitiesArr = {
      ru: editAmenities.ru.split(/[,\n]/).map(s => s.trim()).filter(Boolean),
      az: editAmenities.az.split(/[,\n]/).map(s => s.trim()).filter(Boolean),
      en: editAmenities.en.split(/[,\n]/).map(s => s.trim()).filter(Boolean),
    }

    return {
      name: createLocalizedString(editName.ru, editName.az, editName.en),
      price: parseFloat(editPrice) || 0,
      capacity: parseInt(editCapacity, 10) || 1,
      description: createLocalizedString(editDescription.ru, editDescription.az, editDescription.en),
      conditions: createLocalizedString(editConditions.ru, editConditions.az, editConditions.en),
      advantages: advantagesArr,
      amenities: amenitiesArr,
      images: editImages,
      bookingUrl: editBookingUrl,
    }
  }

  const saveRoomChanges = async () => {
    if (!editId || isCreating) return
    setSaving(true)

    const roomData = { id: editId, ...buildRoomData() }

    try {
      const res = await fetch('/api/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(authHeaders ?? {}) },
        body: JSON.stringify(roomData),
      })
      if (res.ok) {
        const updated = await res.json()
        onRoomUpdate(updated)
        cancelEditing()
        toast({ title: 'Сохранено', description: 'Данные успешно сохранены' })
      } else {
        const error = await res.json()
        toast({ title: 'Ошибка', description: error.error || 'Не удалось сохранить', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Ошибка при сохранении', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const createRoom = async () => {
    if (!isCreating) return
    setSaving(true)

    const roomData = buildRoomData()

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authHeaders ?? {}) },
        body: JSON.stringify(roomData),
      })
      if (res.ok) {
        const newRoom = await res.json()
        onRoomCreate(newRoom)
        cancelEditing()
        toast({ title: 'Создано', description: 'Новый домик успешно добавлен' })
      } else {
        const error = await res.json()
        toast({ title: 'Ошибка', description: error.error || 'Не удалось создать домик', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Ошибка при создании домика', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const deleteRoom = async (roomId: string) => {
    if (!confirm('Удалить этот домик?')) return

    try {
      const res = await fetch(`/api/rooms?id=${roomId}`, {
        method: 'DELETE',
        headers: authHeaders,
      })
      if (res.ok) {
        onRoomDelete?.(roomId)
        toast({ title: 'Удалено', description: 'Домик удалён' })
      } else {
        const error = await res.json()
        toast({ title: 'Ошибка', description: error.error || 'Не удалось удалить', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Ошибка при удалении', variant: 'destructive' })
    }
  }

  const handleSave = () => {
    if (isCreating) {
      createRoom()
    } else {
      saveRoomChanges()
    }
  }

  // Language tab button style
  const langTabClass = (lang: Language) => `
    px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1
    ${editLang === lang
      ? 'bg-primary text-white'
      : 'bg-muted hover:bg-muted/80'
    }
  `

  // Shared form JSX for both creating and editing
  const renderForm = () => (
    <CardContent className="p-4 space-y-4">
      {/* Language Tabs */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Язык:</span>
        <div className="flex gap-1">
          {languages.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => setEditLang(l.code)}
              className={langTabClass(l.code)}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Name & Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-name">
            Название
            <Badge variant="outline" className="ml-2 text-xs">{editLang.toUpperCase()}</Badge>
          </Label>
          <Input
            id="edit-name"
            value={editName[editLang]}
            onChange={(e) => updateLocalizedField(setEditName, editName, editLang, e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="edit-price">Цена (AZN)</Label>
          <Input id="edit-price" type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
        </div>
      </div>

      {/* Capacity */}
      <div>
        <Label htmlFor="edit-capacity">Вместимость (гостей)</Label>
        <Input id="edit-capacity" type="number" value={editCapacity} onChange={(e) => setEditCapacity(e.target.value)} />
      </div>

      {/* Booking.com URL */}
      <div>
        <Label htmlFor="edit-booking-url">Booking.com URL</Label>
        <Input
          id="edit-booking-url"
          type="url"
          value={editBookingUrl}
          onChange={(e) => setEditBookingUrl(e.target.value)}
          placeholder="https://www.booking.com/hotel/az/..."
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="edit-description">
          Описание
          <Badge variant="outline" className="ml-2 text-xs">{editLang.toUpperCase()}</Badge>
        </Label>
        <Textarea
          id="edit-description"
          value={editDescription[editLang]}
          onChange={(e) => updateLocalizedField(setEditDescription, editDescription, editLang, e.target.value)}
          rows={3}
        />
      </div>

      {/* Conditions */}
      <div>
        <Label htmlFor="edit-conditions">
          Условия проживания
          <Badge variant="outline" className="ml-2 text-xs">{editLang.toUpperCase()}</Badge>
        </Label>
        <Textarea
          id="edit-conditions"
          value={editConditions[editLang]}
          onChange={(e) => updateLocalizedField(setEditConditions, editConditions, editLang, e.target.value)}
          rows={4}
          placeholder="• Заезд: с 14:00&#10;• Выезд: до 12:00&#10;• Курение запрещено"
        />
      </div>

      {/* Advantages */}
      <div>
        <Label htmlFor="edit-advantages">
          Преимущества (каждое с новой строки)
          <Badge variant="outline" className="ml-2 text-xs">{editLang.toUpperCase()}</Badge>
        </Label>
        <Textarea
          id="edit-advantages"
          value={editAdvantages[editLang]}
          onChange={(e) => updateLocalizedField(setEditAdvantages, editAdvantages, editLang, e.target.value)}
          rows={4}
          placeholder="Красивый вид&#10;Тихое место&#10;Камин"
        />
      </div>

      {/* Amenities */}
      <div>
        <Label htmlFor="edit-amenities">
          Удобства (через запятую)
          <Badge variant="outline" className="ml-2 text-xs">{editLang.toUpperCase()}</Badge>
        </Label>
        <Input
          id="edit-amenities"
          value={editAmenities[editLang]}
          onChange={(e) => updateLocalizedField(setEditAmenities, editAmenities, editLang, e.target.value)}
          placeholder="Wi-Fi, Камин, ТВ, Кухня"
        />
      </div>

      {/* Images */}
      <ImageUploader
        images={editImages}
        onImagesChange={setEditImages}
        authHeaders={authHeaders}
      />

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {isCreating ? 'Создать' : 'Сохранить'}
        </Button>
        <Button variant="outline" onClick={cancelEditing} disabled={saving}>
          Отмена
        </Button>
      </div>
    </CardContent>
  )

  return (
    <div className="space-y-6 py-4">
      {/* Add room button */}
      <div className="flex justify-end">
        <Button onClick={startCreatingRoom} disabled={editId !== null} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Добавить домик
        </Button>
      </div>

      {/* New room form (appears at top when creating) */}
      {isCreating && (
        <Card className="overflow-hidden border-primary/50">
          {renderForm()}
        </Card>
      )}

      {/* Existing rooms list */}
      {rooms.map((room) => {
        const displayName = getLocalizedValue(room.name, 'ru', room.name)

        return (
          <Card key={room.id} className="overflow-hidden">
            {editId === room.id ? (
              renderForm()
            ) : (
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{displayName}</h3>
                    <p className="text-sm text-muted-foreground">{room.price} AZN / ночь • до {room.capacity} гостей</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEditingRoom(room)} disabled={editId !== null}>
                      Редактировать
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteRoom(room.id)} disabled={editId !== null}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}

      {rooms.length === 0 && !isCreating && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Нет домиков</p>
          <p className="text-sm">Нажмите "Добавить домик" чтобы создать первый</p>
        </div>
      )}
    </div>
  )
}
