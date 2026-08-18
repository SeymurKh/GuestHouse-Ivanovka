'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SettingsManagerProps {
  authHeaders?: Record<string, string>
  onSaved?: () => void
}

export function SettingsManager({ authHeaders, onSaved }: SettingsManagerProps) {
  const { toast } = useToast()
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      setLoading(true)
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          if (data) {
            setPhone(data.phone || '')
            setEmail(data.email || '')
            setAddress(data.address || '')
            setDescription(data.description || '')
          }
        }
      } catch {
        // Failed to load settings
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(authHeaders ?? {}) },
        body: JSON.stringify({ phone, email, address, description }),
      })

      if (res.ok) {
        onSaved?.()
        toast({
          title: 'Сохранено',
          description: 'Настройки успешно сохранены',
        })
      } else {
        const error = await res.json()
        toast({
          title: 'Ошибка',
          description: error.error || 'Не удалось сохранить',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Ошибка при сохранении настроек',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4 py-4">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="settings-phone">Телефон</Label>
          <Input
            id="settings-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+994XXXXXXXXX"
          />
        </div>
        <div>
          <Label htmlFor="settings-email">Email</Label>
          <Input
            id="settings-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </div>
        <div>
          <Label htmlFor="settings-address">Адрес</Label>
          <Input
            id="settings-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Азербайджан, г. Исмаиллы, посёлок Ивановка"
          />
        </div>
        <div>
          <Label htmlFor="settings-description">Описание сайта</Label>
          <Textarea
            id="settings-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Краткое описание сайта"
          />
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="bg-primary hover:bg-primary/90">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Сохранить настройки
      </Button>
    </div>
  )
}