import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateId, stringifyJsonField } from '@/lib/schema'
import { withAdminAuth } from '@/lib/middleware'
import { demoRooms, demoSettings } from '@/lib/demo-data'

// Инициализация начальных данных из demo-data (единый источник истины).
// Срабатывает только на пустой БД — первый запуск на новом сервере.
// При миграции на Hetzner предпочтительный путь — копирование data/guesthouse.db.
export const POST = withAdminAuth(async () => {
  try {
    const row = db.prepare('SELECT COUNT(*) as count FROM Room').get() as { count: number }
    if (row.count > 0) {
      return NextResponse.json({ message: 'Данные уже инициализированы' })
    }

    const insertRoom = db.prepare(`
      INSERT INTO Room (id, name, description, conditions, advantages, price, capacity, amenities, images, isAvailable)
      VALUES (@id, @name, @description, @conditions, @advantages, @price, @capacity, @amenities, @images, @isAvailable)
    `)

    for (const room of demoRooms) {
      insertRoom.run({
        id: generateId(),
        // name/description/conditions в demo-data уже хранятся как localized JSON-строки
        name: room.name,
        description: room.description,
        conditions: room.conditions,
        advantages: stringifyJsonField(room.advantages),
        price: room.price,
        capacity: room.capacity,
        amenities: stringifyJsonField(room.amenities),
        images: stringifyJsonField(room.images),
        isAvailable: room.isAvailable ? 1 : 0,
      })
    }

    // Настройки сайта
    const settingsRow = db.prepare('SELECT COUNT(*) as count FROM SiteSettings').get() as { count: number }
    if (settingsRow.count === 0) {
      db.prepare(`
        INSERT INTO SiteSettings (id, phone, email, address, description)
        VALUES (@id, @phone, @email, @address, @description)
      `).run({
        id: generateId(),
        phone: demoSettings.phone,
        email: demoSettings.email,
        address: demoSettings.address,
        description: demoSettings.description,
      })
    }

    // Отзывы не сидим: демо-отзывы — заглушки, реальные добавляются через админку

    return NextResponse.json({
      message: 'Данные успешно инициализированы',
      roomsCreated: demoRooms.length,
    })
  } catch (error) {
    console.error('[Init POST Error]', error)
    return NextResponse.json({ error: 'Ошибка при инициализации данных' }, { status: 500 })
  }
})
