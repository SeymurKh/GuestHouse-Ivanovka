'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Globe } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { parseLocalizedStringToForm } from '@/lib/localize'
import { languages, Language } from '@/lib/i18n'

interface SettingsManagerProps {
  authHeaders?: Record<string, string>
  onSaved?: () => void
}

interface LocalizedField {
  ru: string
  az: string
  en: string
}

export function SettingsManager({ authHeaders, onSaved }: SettingsManagerProps) {
  const { toast } = useToast()
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState<LocalizedField>({ ru: '', az: '', en: '' })
  const [editLang, setEditLang] = useState<Language>('ru')
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
            setAddress(parseLocalizedStringToForm(data.address))
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

  const updateAddress = (lang: Language, value: string) => {
    setAddress((prev) => ({ ...prev, [lang]: value }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(authHeaders ?? {}) },
        body: JSON.stringify({
          phone,
          email,
          address: {
            ru: address.ru,
            az: address.az,
            en: address.en,
          },
        }),
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

  const langTabClass = (lang: Language) => `
    px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1
    ${editLang === lang
      ? 'bg-primary text-white'
      : 'bg-muted hover:bg-muted/80'
    }
  `

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

        {/* Localized address */}
        <div>
          <Label htmlFor="settings-address" className="flex items-center gap-2">
            Адрес
            <Badge variant="outline" className="text-xs">{editLang.toUpperCase()}</Badge>
          </Label>

          <div className="flex items-center gap-2 mt-2 mb-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {languages.map((l) => (
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

          <Input
            id="settings-address"
            value={address[editLang]}
            onChange={(e) => updateAddress(editLang, e.target.value)}
            placeholder="Азербайджан, г. Исмаиллы, посёлок Ивановка"
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