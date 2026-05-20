import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mapSettingsRow, generateId } from '@/lib/schema'
import { withAdminAuth, validateInput, sanitize } from '@/lib/middleware'

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
    const { phone, email, address, description } = body

    // Validate input
    const validation = validateInput.settings({ phone, email, address, description })
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors[0] },
        { status: 400 }
      )
    }

    const existing = db.prepare('SELECT * FROM SiteSettings LIMIT 1').get() as Record<string, unknown> | undefined

    let row: Record<string, unknown>

    if (existing) {
      db.prepare(`
        UPDATE SiteSettings SET
          phone = @phone,
          email = @email,
          address = @address,
          description = @description
        WHERE id = @id
      `).run({
        id: existing.id,
        phone: sanitize.phone(phone),
        email: sanitize.email(email || ''),
        address: sanitize.text(address || ''),
        description: sanitize.text(description || ''),
      })
      row = db.prepare('SELECT * FROM SiteSettings WHERE id = ?').get(existing.id) as Record<string, unknown>
    } else {
      const id = generateId()
      db.prepare(`
        INSERT INTO SiteSettings (id, phone, email, address, description)
        VALUES (@id, @phone, @email, @address, @description)
      `).run({
        id,
        phone: sanitize.phone(phone),
        email: sanitize.email(email || ''),
        address: sanitize.text(address || ''),
        description: sanitize.text(description || ''),
      })
      row = db.prepare('SELECT * FROM SiteSettings WHERE id = ?').get(id) as Record<string, unknown>
    }

    return NextResponse.json(mapSettingsRow(row))
  } catch (error) {
    console.error('[Settings Update Error]', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Ошибка при обновлении настроек' }, { status: 500 })
  }
})
