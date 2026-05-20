import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mapReviewRow, generateId } from '@/lib/schema'
import { withAdminAuth, validateInput, sanitize, sanitizeBoolean, getAuthTokenFromRequest, verifyAdminToken, isValidId } from '@/lib/middleware'

// GET - получить одобренные отзывы (или все для админа)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'
    const token = getAuthTokenFromRequest(request)

    if (all && !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized - Admin token required' }, { status: 401 })
    }

    let rows: Record<string, unknown>[]
    if (all) {
      rows = db.prepare('SELECT * FROM Review ORDER BY createdAt DESC LIMIT 10').all() as Record<string, unknown>[]
    } else {
      rows = db.prepare('SELECT * FROM Review WHERE isApproved = 1 ORDER BY createdAt DESC LIMIT 20').all() as Record<string, unknown>[]
    }

    const reviews = rows.map(mapReviewRow)
    return NextResponse.json(reviews)
  } catch (error) {
    console.error('[Reviews GET Error]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Ошибка при получении отзывов' }, { status: 500 })
  }
}

// POST - создать новый отзыв
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { guestName, rating, comment, isApproved } = body
    const token = getAuthTokenFromRequest(request)

    // Validate input
    const validation = validateInput.review({ guestName, rating, comment })
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors[0] },
        { status: 400 }
      )
    }

    const approved = sanitizeBoolean(isApproved)
    if (approved && !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized - Admin token required' }, { status: 401 })
    }

    const ratingValue = parseInt(String(rating), 10)
    const id = generateId()

    db.prepare(`
      INSERT INTO Review (id, guestName, rating, comment, isApproved)
      VALUES (@id, @guestName, @rating, @comment, @isApproved)
    `).run({
      id,
      guestName: sanitize.text(guestName),
      rating: Math.min(5, Math.max(1, ratingValue)),
      comment: sanitize.text(comment),
      isApproved: approved ? 1 : 0,
    })

    const row = db.prepare('SELECT * FROM Review WHERE id = ?').get(id) as Record<string, unknown>
    return NextResponse.json(mapReviewRow(row), { status: 201 })
  } catch (error) {
    console.error('[Review Create Error]', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Ошибка при создании отзыва' }, { status: 500 })
  }
}

// PUT - обновить отзыв (полное редактирование, requires admin auth)
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, guestName, rating, comment, isApproved } = body

    if (!isValidId(id)) {
      return NextResponse.json({ error: 'ID отзыва не указан или некорректен' }, { status: 400 })
    }

    // Check review exists
    const existing = db.prepare('SELECT * FROM Review WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!existing) {
      return NextResponse.json({ error: 'Отзыв не найден' }, { status: 404 })
    }

    // Build dynamic SET clause
    const setClauses: string[] = []
    const params: Record<string, unknown> = { id }

    if (guestName !== undefined) { setClauses.push('guestName = @guestName'); params.guestName = sanitize.text(guestName) }
    if (rating !== undefined) {
      const ratingValue = parseInt(String(rating), 10)
      if (Number.isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
      }
      setClauses.push('rating = @rating'); params.rating = Math.min(5, Math.max(1, ratingValue))
    }
    if (comment !== undefined) { setClauses.push('comment = @comment'); params.comment = sanitize.text(comment) }
    if (isApproved !== undefined) { setClauses.push('isApproved = @isApproved'); params.isApproved = sanitizeBoolean(isApproved) ? 1 : 0 }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'Нет данных для обновления отзыва' }, { status: 400 })
    }

    const sql = `UPDATE Review SET ${setClauses.join(', ')} WHERE id = @id`
    db.prepare(sql).run(params)

    const row = db.prepare('SELECT * FROM Review WHERE id = ?').get(id) as Record<string, unknown>
    return NextResponse.json(mapReviewRow(row))
  } catch (error) {
    console.error('[Review Update Error]', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Ошибка при обновлении отзыва' }, { status: 500 })
  }
})

// DELETE - удалить отзыв (requires admin auth)
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!isValidId(id)) {
      return NextResponse.json({ error: 'ID отзыва не указан или некорректен' }, { status: 400 })
    }

    const existing = db.prepare('SELECT * FROM Review WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!existing) {
      return NextResponse.json({ error: 'Отзыв не найден' }, { status: 404 })
    }

    db.prepare('DELETE FROM Review WHERE id = ?').run(id)

    return NextResponse.json({ success: true, message: 'Отзыв удален' })
  } catch (error) {
    console.error('[Review Delete Error]', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Ошибка при удалении отзыва' }, { status: 500 })
  }
})
