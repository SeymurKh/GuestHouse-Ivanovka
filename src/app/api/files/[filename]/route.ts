import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const mimeTypes: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
}

// Отдача загруженных файлов динамически.
// ВАЖНО: Next.js в продакшене отдаёт public/ только для файлов, существовавших
// на момент сборки/старта — файлы, загруженные через админку позже, были бы 404.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    if (!filename.match(/^[\d\-a-z]+\.(jpg|jpeg|png|gif|webp)$/i)) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    const uploadsDir = path.resolve(process.cwd(), 'public/uploads')
    const filepath = path.resolve(uploadsDir, filename)

    // Защита от path traversal
    if (!filepath.startsWith(uploadsDir + path.sep)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    if (!existsSync(filepath)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const buffer = await readFile(filepath)
    const ext = filename.split('.').pop()!.toLowerCase()

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('[Files GET Error]', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Ошибка при чтении файла' }, { status: 500 })
  }
}
