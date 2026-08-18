import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mapGalleryImageRow, generateId } from '@/lib/schema'
import { withAdminAuth, isValidId } from '@/lib/middleware'
import { existsSync } from 'fs'
import { unlink } from 'fs/promises'
import path from 'path'

// Validates an image URL. Accepts:
// - /images/... (bundled assets)
// - /uploads/... (legacy)
// - /api/files/... (runtime uploads)
function isValidImageUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false
  return (
    url.startsWith('/images/') ||
    url.startsWith('/uploads/') ||
    url.startsWith('/api/files/')
  )
}

// GET - получить все фото галереи (публичный)
export async function GET() {
  try {
    const rows = db
      .prepare('SELECT * FROM GalleryImage ORDER BY sortOrder ASC, createdAt ASC')
      .all() as Record<string, unknown>[]
    return NextResponse.json(rows.map(mapGalleryImageRow))
  } catch (error) {
    console.error('[Gallery GET Error]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Ошибка при получении галереи' }, { status: 500 })
  }
}

// POST - добавить фото (admin)
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { url } = body

    if (!isValidImageUrl(url)) {
      return NextResponse.json(
        { error: 'Некорректный URL изображения' },
        { status: 400 }
      )
    }

    const maxRow = db
      .prepare('SELECT MAX(sortOrder) AS maxOrder FROM GalleryImage')
      .get() as { maxOrder: number | null }
    const nextOrder = (maxRow.maxOrder ?? -1) + 1

    const id = generateId()
    db.prepare(
      'INSERT INTO GalleryImage (id, url, sortOrder) VALUES (@id, @url, @sortOrder)'
    ).run({ id, url, sortOrder: nextOrder })

    const row = db.prepare('SELECT * FROM GalleryImage WHERE id = ?').get(id) as Record<string, unknown>
    return NextResponse.json(mapGalleryImageRow(row), { status: 201 })
  } catch (error) {
    console.error('[Gallery Create Error]', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Ошибка при добавлении фото' }, { status: 500 })
  }
})

// PUT - обновить порядок (admin). Body: { items: [{ id, sortOrder }] }
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const items = body?.items

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 })
    }

    const updateStmt = db.prepare('UPDATE GalleryImage SET sortOrder = @sortOrder WHERE id = @id')
    const ids = new Set<string>()

    const updateAll = db.transaction((entries: { id: string; sortOrder: number }[]) => {
      for (const entry of entries) {
        if (!isValidId(entry.id) || typeof entry.sortOrder !== 'number' || Number.isNaN(entry.sortOrder)) {
          continue
        }
        ids.add(entry.id)
        updateStmt.run({ id: entry.id, sortOrder: entry.sortOrder })
      }
    })

    updateAll(items)

    const rows = db
      .prepare('SELECT * FROM GalleryImage ORDER BY sortOrder ASC, createdAt ASC')
      .all() as Record<string, unknown>[]
    return NextResponse.json(rows.map(mapGalleryImageRow))
  } catch (error) {
    console.error('[Gallery Reorder Error]', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Ошибка при обновлении порядка' }, { status: 500 })
  }
})

// DELETE - удалить фото (admin)
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!isValidId(id)) {
      return NextResponse.json({ error: 'ID фото не указан или некорректен' }, { status: 400 })
    }

    const existing = db.prepare('SELECT * FROM GalleryImage WHERE id = ?').get(id) as
      | Record<string, unknown>
      | undefined
    if (!existing) {
      return NextResponse.json({ error: 'Фото не найдено' }, { status: 404 })
    }

    db.prepare('DELETE FROM GalleryImage WHERE id = ?').run(id)

    // Если файл — runtime-загрузка, удаляем и сам файл с диска
    const url = existing.url as string
    if (url.startsWith('/api/files/')) {
      const filename = url.split('/').pop() || ''
      if (filename.match(/^[\d\-a-z]+\.(jpg|jpeg|png|gif|webp)$/i)) {
        const uploadsDir = path.resolve(process.cwd(), 'public/uploads')
        const filepath = path.resolve(uploadsDir, filename)
        if (filepath.startsWith(uploadsDir + path.sep) && existsSync(filepath)) {
          await unlink(filepath)
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Фото удалено' })
  } catch (error) {
    console.error('[Gallery Delete Error]', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Ошибка при удалении фото' }, { status: 500 })
  }
})