import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateId, stringifyJsonField } from '@/lib/schema'
import { withAdminAuth } from '@/lib/middleware'

// Инициализация начальных данных
export const POST = withAdminAuth(async () => {
  try {
    // Проверяем, есть ли уже номера
    const row = db.prepare('SELECT COUNT(*) as count FROM Room').get() as { count: number }
    if (row.count > 0) {
      return NextResponse.json({ message: 'Данные уже инициализированы' })
    }

    // Создаем 2 домика
    const room1Id = generateId()
    const room2Id = generateId()

    const insertRoom = db.prepare(`
      INSERT INTO Room (id, name, description, conditions, advantages, price, capacity, amenities, images, isAvailable)
      VALUES (@id, @name, @description, @conditions, @advantages, @price, @capacity, @amenities, @images, @isAvailable)
    `)

    insertRoom.run({
      id: room1Id,
      name: 'Домик "Лесная сказка"',
      description: 'Уютный деревянный домик, расположенный в самом сердце леса. Идеально подходит для пар или небольших семей. Внутри царит теплая атмосфера благодаря натуральным материалам и камину. Из окон открывается потрясающий вид на горы и густой лес. Пробуждение под пение птиц и шум листвы станет лучшим началом вашего дня.',
      conditions: '• Заезд: с 14:00\n• Выезд: до 12:00\n• Размещение с домашними животными: по согласованию\n• Курение в доме запрещено\n• Тишина после 23:00\n• Максимальное количество гостей: 3',
      advantages: stringifyJsonField([
        'Уединенное расположение в лесу',
        'Настоящий камин для уютных вечеров',
        'Панорамные окна с видом на горы',
        'Собственная терраса с барбекю',
        'Экологичные материалы отделки',
        'Полная автономия и приватность'
      ]),
      price: 200,
      capacity: 3,
      amenities: stringifyJsonField(['Wi-Fi', 'Камин', 'ТВ', 'Кухня', 'Терраса', 'Барбекю', 'Парковка']),
      images: stringifyJsonField(['/uploads/1777649519209-r3g6cl.jpg', '/uploads/1777650210140-6051oi.jpg']),
      isAvailable: 1,
    })

    insertRoom.run({
      id: room2Id,
      name: 'Домик "Горный пик"',
      description: 'Просторный премиум домик с захватывающим панорамным видом на Кавказские горы. Создан для тех, кто ценит комфорт и единение с природой. Две уютные спальни, просторная гостиная с камином и полностью оборудованная кухня. Частная терраса с джакузи станет вашим любимым местом для отдыха под звездным небом Габалы.',
      conditions: '• Заезд: с 14:00\n• Выезд: до 12:00\n• Размещение с домашними животными: по согласованию\n• Курение в доме запрещено\n• Тишина после 23:00\n• Максимальное количество гостей: 5',
      advantages: stringifyJsonField([
        'Премиум расположение с лучшими видами',
        'Частное джакузи на террасе',
        'Две просторные спальни',
        'Полностью оборудованная кухня',
        'Большой камин в гостиной',
        'Отдельный вход и частная территория',
        'Идеально для семейного отдыха'
      ]),
      price: 400,
      capacity: 5,
      amenities: stringifyJsonField(['Wi-Fi', 'Камин', 'Джакузи', 'ТВ', 'Кухня', 'Терраса', 'Барбекю', 'Парковка', '2 спальни']),
      images: stringifyJsonField(['/uploads/1777650213066-2dtfbl.jpg', '/uploads/1777649519209-r3g6cl.jpg']),
      isAvailable: 1,
    })

    // Создаем настройки сайта
    const settingsId = generateId()
    db.prepare(`
      INSERT INTO SiteSettings (id, phone, email, address, description)
      VALUES (@id, @phone, @email, @address, @description)
    `).run({
      id: settingsId,
      phone: '+994 50 123 45 67',
      email: 'info@guesthouse-ivanovka.az',
      address: 'Азербайджан, Исмаиллы',
      description: 'Уютные дома для отдыха в горах Азербайджана. Отдых в окружении величественных гор и густых лесов.',
    })

    // Создаем начальные отзывы (5 штук)
    const insertReview = db.prepare(`
      INSERT INTO Review (id, guestName, rating, comment, isApproved)
      VALUES (@id, @guestName, @rating, @comment, @isApproved)
    `)

    const reviews = [
      { guestName: 'Али Мамедов', rating: 5, comment: 'Потрясающее место! Горы, лес, тишина и покой. Обязательно вернёмся!', isApproved: 1 },
      { guestName: 'Елена Петрова', rating: 5, comment: 'Идеальный отдых для семьи. Дети были в восторге от природы. Персонал очень приветливый.', isApproved: 1 },
      { guestName: 'Мехмет Кязимов', rating: 4, comment: 'Отличное место для расслабления. Виды невероятные. Рекомендую домик "Горный пик".', isApproved: 1 },
      { guestName: 'Анна Соколова', rating: 5, comment: 'Провели здесь выходные и не хотели уезжать! Камин, уютная атмосфера, невероятные виды на горы. Спасибо за гостеприимство!', isApproved: 1 },
      { guestName: 'Рафик Гасанов', rating: 5, comment: 'Лучший отдых! Тишина, природа, чистый воздух. Домики очень уютные и чистые. Обязательно вернемся снова.', isApproved: 1 },
    ]

    for (const review of reviews) {
      insertReview.run({
        id: generateId(),
        ...review,
      })
    }

    return NextResponse.json({
      message: 'Данные успешно инициализированы',
      roomsCreated: 2,
    })
  } catch (error) {
    console.error('[Init POST Error]', error)
    return NextResponse.json({ error: 'Ошибка при инициализации данных' }, { status: 500 })
  }
})
