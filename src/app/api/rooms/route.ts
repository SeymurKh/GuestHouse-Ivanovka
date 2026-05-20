import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mapRoomRow, generateId, stringifyJsonField } from '@/lib/schema'
import { withAdminAuth, validateInput, sanitize, isValidId } from '@/lib/middleware'

// Helper to normalize JSON-compatible room fields
function normalizeJsonField(value: unknown) {
  if (value === undefined || value === null) {
    return []
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return [value]
    }
  }

  return value
}

// GET - получить все домики
export async function GET() {
  try {
    const rows = db.prepare('SELECT * FROM Room WHERE isAvailable = 1 ORDER BY createdAt ASC').all() as Record<string, unknown>[]
    const rooms = rows.map(mapRoomRow)
    return NextResponse.json(rooms)
  } catch (error) {
    console.error('[Rooms GET Error]', error)
    return NextResponse.json({ error: 'Ошибка при получении домиков' }, { status: 500 })
  }
}

// POST - создать новый домик (requires admin auth)
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { name, description, conditions, advantages, price, capacity, amenities, images } = body

    // Validate input
    const validation = validateInput.room({ name, description, price, capacity })
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors[0] },
        { status: 400 }
      )
    }

    const id = generateId()
    const stmt = db.prepare(`
      INSERT INTO Room (id, name, description, conditions, advantages, price, capacity, amenities, images, isAvailable)
      VALUES (@id, @name, @description, @conditions, @advantages, @price, @capacity, @amenities, @images, @isAvailable)
    `)

    stmt.run({
      id,
      name: sanitize.text(name),
      description: sanitize.text(description),
      conditions: sanitize.text(conditions),
      advantages: stringifyJsonField(normalizeJsonField(advantages)),
      price: parseFloat(String(price)) || 0,
      capacity: parseInt(String(capacity), 10) || 2,
      amenities: stringifyJsonField(normalizeJsonField(amenities)),
      images: stringifyJsonField(normalizeJsonField(images)),
      isAvailable: 1,
    })

    const row = db.prepare('SELECT * FROM Room WHERE id = ?').get(id) as Record<string, unknown>
    return NextResponse.json(mapRoomRow(row), { status: 201 })
  } catch (error) {
    console.error('[Room Create Error]', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Ошибка при создании домика' }, { status: 500 })
  }
})

// PUT - обновить домик (requires admin auth)
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, name, description, conditions, advantages, price, capacity, amenities, images, isAvailable } = body

    if (!isValidId(id)) {
      return NextResponse.json({ error: 'ID домика не указан или некорректен' }, { status: 400 })
    }

    // Check room exists
    const existing = db.prepare('SELECT * FROM Room WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!existing) {
      return NextResponse.json({ error: 'Домик не найден' }, { status: 404 })
    }

    // Build dynamic SET clause
    const setClauses: string[] = []
    const params: Record<string, unknown> = { id }

    if (name !== undefined) { setClauses.push('name = @name'); params.name = sanitize.text(name) }
    if (description !== undefined) { setClauses.push('description = @description'); params.description = sanitize.text(description) }
    if (conditions !== undefined) { setClauses.push('conditions = @conditions'); params.conditions = sanitize.text(conditions) }
    if (advantages !== undefined) { setClauses.push('advantages = @advantages'); params.advantages = stringifyJsonField(normalizeJsonField(advantages)) }
    if (price !== undefined) {
      const val = parseFloat(String(price))
      if (Number.isNaN(val) || val < 0 || val > 100000) {
        return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
      }
      setClauses.push('price = @price'); params.price = val
    }
    if (capacity !== undefined) {
      const val = parseInt(String(capacity), 10)
      if (Number.isNaN(val) || val < 1 || val > 50) {
        return NextResponse.json({ error: 'Invalid capacity' }, { status: 400 })
      }
      setClauses.push('capacity = @capacity'); params.capacity = val
    }
    if (amenities !== undefined) { setClauses.push('amenities = @amenities'); params.amenities = stringifyJsonField(normalizeJsonField(amenities)) }
    if (images !== undefined) { setClauses.push('images = @images'); params.images = stringifyJsonField(normalizeJsonField(images)) }
    if (isAvailable !== undefined) {
      if (typeof isAvailable !== 'boolean') {
        return NextResponse.json({ error: 'Поле isAvailable должно быть булевым' }, { status: 400 })
      }
      setClauses.push('isAvailable = @isAvailable'); params.isAvailable = isAvailable ? 1 : 0
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 })
    }

    // Always update updatedAt
    setClauses.push("updatedAt = datetime('now')")

    const sql = `UPDATE Room SET ${setClauses.join(', ')} WHERE id = @id`
    db.prepare(sql).run(params)

    const row = db.prepare('SELECT * FROM Room WHERE id = ?').get(id) as Record<string, unknown>
    return NextResponse.json(mapRoomRow(row))
  } catch (error) {
    console.error('[Room Update Error]', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Ошибка при обновлении домика' }, { status: 500 })
  }
})

// DELETE - удалить домик (soft delete via isAvailable, requires admin auth)
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!isValidId(id)) {
      return NextResponse.json({ error: 'ID домика не указан или некорректен' }, { status: 400 })
    }

    const existing = db.prepare('SELECT * FROM Room WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!existing) {
      return NextResponse.json({ error: 'Домик не найден' }, { status: 404 })
    }

    db.prepare("UPDATE Room SET isAvailable = 0, updatedAt = datetime('now') WHERE id = ?").run(id)

    const row = db.prepare('SELECT * FROM Room WHERE id = ?').get(id) as Record<string, unknown>
    return NextResponse.json(mapRoomRow(row))
  } catch (error) {
    console.error('[Room Delete Error]', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Ошибка при удалении домика' }, { status: 500 })
  }
})
