// Static demo data for Vercel deployment (no database needed)
// Used when NEXT_PUBLIC_DEMO_MODE=true
// Data exported from real SQLite database (data/guesthouse.db) on 2026-05-21

import { Room, Review } from '@/types'

export const demoRooms: Room[] = [
  {
    id: 'demo-room-1',
    name: '{"ru":"ROOM Micheli\'s Guest House","az":"","en":""}',
    description: '{"ru":"Просторный дом для отдыха в Ивановке с приватной территорией, бассейном и полной инфраструктурой для комфортного проживания.\\nИдеально подходит для семей, компаний друзей и спокойных выходных на природе.","az":"","en":""}',
    conditions: '{"ru":"• Заезд: 14:00\\n• Выезд: 13:00\\n• Курение в доме запрещено","az":"","en":""}',
    advantages: {
      ru: ['2 спальни', 'Гостиная зона', 'Полностью оборудованная кухня', 'Обеденная зона', 'Собственный бассейн', 'Терраса и сад'],
      az: [],
      en: [],
    },
    price: 150,
    capacity: 4,
    amenities: {
      ru: ['Бесплатный Wi-Fi', 'Частная парковка', 'Открытый бассейн', 'BBQ зона', 'Завтрак', 'Настольные Игры', 'Размещение с животными'],
      az: [],
      en: [],
    },
    images: [
      '/uploads/1779360660288-qdexlg.jpg',
      '/uploads/1779360671031-8m5a2q.jpg',
      '/uploads/1779360675513-fgv2kd.jpg',
      '/uploads/1779360678094-qp6oks.jpg',
      '/uploads/1779360682025-uuaijy.jpg',
      '/uploads/1779360684765-g6buto.jpg',
      '/uploads/1779360687418-glarnu.jpg',
      '/uploads/1779360691434-dq7uoy.jpg',
      '/uploads/1779360695047-tzx2aq.jpg',
      '/uploads/1779360698374-rhe5x1.jpg',
      '/uploads/1779360701557-8amjjm.jpg',
      '/uploads/1779360704229-fpxir6.jpg',
      '/uploads/1779360706872-piu228.jpg',
      '/uploads/1779360709834-6yyyfn.jpg',
    ],
    isAvailable: true,
  },
  {
    id: 'demo-room-2',
    name: '{"ru":"ROOM Miran\'s Guest House","az":"","en":""}',
    description: '{"ru":"Уютный загородный дом в Ивановке с атмосферой спокойствия, приватности и полного отдыха на природе.\\nПодходит для семейного отдыха и небольших компаний","az":"","en":""}',
    conditions: '{"ru":"• Заезд: 14:00\\n• Выезд: 13:00\\n• Курение в доме запрещено","az":"","en":""}',
    advantages: {
      ru: ['2 спальни', 'Гостиная', 'Кухня', 'Терраса', 'Сад'],
      az: [],
      en: [],
    },
    price: 150,
    capacity: 4,
    amenities: {
      ru: ['Бесплатный Wi-Fi', 'Бесплатная парковка', 'BBQ зона', 'Завтрак', 'Настольные Игры', 'Размещение с животными', 'Сауна (доп. оплата)'],
      az: [],
      en: [],
    },
    images: [
      '/uploads/1779361580460-5seqz2.jpg',
      '/uploads/1779361584068-t9lhmn.jpg',
      '/uploads/1779361589370-ly2jci.jpg',
      '/uploads/1779361591865-6axj6r.jpg',
      '/uploads/1779361595896-25ehw3.jpg',
      '/uploads/1779361599486-0z4hdd.jpg',
      '/uploads/1779361604119-j1iq5m.jpg',
      '/uploads/1779361607209-fa5hrb.jpg',
      '/uploads/1779361612849-1vffjj.jpg',
      '/uploads/1779361619855-lu8r9p.jpg',
      '/uploads/1779361622623-fzia0m.jpg',
    ],
    isAvailable: true,
  },
]

export const demoReviews: Review[] = [
  {
    id: 'demo-review-1',
    guestName: 'Новый гость',
    rating: 5,
    comment: 'Текст отзыва...',
    createdAt: '2026-05-20T20:59:56.000Z',
  },
  {
    id: 'demo-review-2',
    guestName: 'Новый гость',
    rating: 5,
    comment: 'Текст отзыва...',
    createdAt: '2026-05-20T21:00:03.000Z',
  },
  {
    id: 'demo-review-3',
    guestName: 'Новый гость',
    rating: 5,
    comment: 'Текст отзыва...',
    createdAt: '2026-05-20T21:00:04.000Z',
  },
]

export const demoSettings = {
  phone: '+994 50 123 45 67',
  email: 'info@guesthouse-ivanovka.az',
  address: 'Азербайджан, Исмаиллы',
  description: 'Уютные гостевые дома в горах Азербайджана. Отдых в окружении величественных гор и густых лесов.',
}
