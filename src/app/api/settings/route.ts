import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mapSettingsRow, generateId } from '@/lib/schema'
import { withAdminAuth, sanitize } from '@/lib/middleware'
import { createLocalizedString } from '@/lib/localize'

// Normalize address to a localized JSON string.
// Accepts either an object {ru,az,en} (new format) or a plain string (legacy → treated as RU).
function normalizeAddress(value: unknown): string {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>
    const str = (v: unknown) => (typeof v === 'string' ? v : '')
    return createLocalizedString(str(obj.ru), str(obj.az), str(obj.en))
  }
  if (typeof value === 'string') {
    return createLocalizedString(value, '', '')
  }
  return createLocalizedString('', '', '')
}

// GET - получить настройки сайта
export async function GET() {
  try {
    const row = db.prepare('SELECT * FROM SiteSettings LIMIT 1').get() as Record<string, unknown> | undefined
    return NextResponse.json(row ? mapSettingsRow(row) : null)
  } catch (error) {
    console.error('[Settings GET Error]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Ошибка при получении настроек' }, { status: 500 })
  }
}

// PUT - обновить настройки (requires admin auth)
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { phone, email, address } = body

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0 || phone.length > 50) {
      return NextResponse.json({ error: 'Phone is required and under 50 characters' }, { status: 400 })
    }

    if (email && typeof email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }
    }

    const addressValue = normalizeAddress(address)

    const existing = db.prepare('SELECT * FROM SiteSettings LIMIT 1').get() as Record<string, unknown> | undefined

    let row: Record<string, unknown>

    if (existing) {
      db.prepare(`
        UPDATE SiteSettings SET
          phone = @phone,
          email = @email,
          address = @address
        WHERE id = @id
      `).run({
        id: existing.id,
        phone: sanitize.phone(phone),
        email: sanitize.email(email || ''),
        address: addressValue,
      })
      row = db.prepare('SELECT * FROM SiteSettings WHERE id = ?').get(existing.id) as Record<string, unknown>
    } else {
      const id = generateId()
      db.prepare(`
        INSERT INTO SiteSettings (id, phone, email, address)
        VALUES (@id, @phone, @email, @address)
      `).run({
        id,
        phone: sanitize.phone(phone),
        email: sanitize.email(email || ''),
        address: addressValue,
      })
      row = db.prepare('SELECT * FROM SiteSettings WHERE id = ?').get(id) as Record<string, unknown>
    }

    return NextResponse.json(mapSettingsRow(row))
  } catch (error) {
    console.error('[Settings Update Error]', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Ошибка при обновлении настроек' }, { status: 500 })
  }
})