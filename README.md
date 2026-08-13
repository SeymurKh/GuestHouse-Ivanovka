# Guest House Ivanovka

Уютные гостевые дома в горах Азербайджана, Исмаиллы. Информационный сайт с обратной связью через WhatsApp и административной панелью.

## 🏠 Особенности

- 📱 Адаптивный дизайн для всех устройств
- 🌍 Мультиязычность: Русский, Азербайджанский, Английский
- 💬 Связь через WhatsApp
- 🔐 Административная панель для управления контентом
- 🏡 Управление домиками и отзывами
- 🖼 Загрузка фотографий через админку

## 🛠 Технологии

- **Next.js 16** — React фреймворк (App Router)
- **TypeScript** — типизация
- **Tailwind CSS 4** — стилизация
- **SQLite (better-sqlite3)** — база данных, файл `data/guesthouse.db`
- **shadcn/ui** — UI компоненты
- **Vitest** — тесты

## 📋 Требования

- Node.js 18+
- npm

## 🚀 Установка и запуск

### 1. Клонирование репозитория

```bash
git clone https://github.com/SeymurKh/GuestHouse-Ivanovka.git
cd GuestHouse-Ivanovka
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка окружения

Создайте файл `.env` на основе `.env.example`:

```bash
copy .env.example .env   # Windows
# или
cp .env.example .env     # Linux/Mac
```

Отредактируйте `.env` и установите свой пароль администратора:

```
ADMIN_PASSWORD="ваш-надежный-пароль"
```

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

База данных SQLite создаётся автоматически при первом запуске (`data/guesthouse.db`). Для наполнения пустой БД начальными данными выполните POST-запрос на `/api/init` с админ-токеном (данные берутся из `src/lib/demo-data.ts`).

## 🔐 Административная панель

1. Нажмите **Ctrl+Shift+A** на клавиатуре
2. Введите пароль администратора
3. Управляйте домиками и отзывами

### Возможности админ-панели:

- Редактирование информации о домиках (на 3 языках)
- Загрузка и удаление фотографий
- Управление отзывами (добавление, редактирование, удаление)

## 🌍 Демо-режим (Vercel)

Сайт может работать без базы данных в демо-режиме (статичные данные из `src/lib/demo-data.ts`). Для этого установите переменную окружения:

```
NEXT_PUBLIC_DEMO_MODE="true"
```

### Синхронизация демо-данных с реальной БД

`src/lib/demo-data.ts` — **автогенерируемый файл, не редактировать вручную!**

После правок контента через админку (локально, с БД) обновите демо-данные:

```bash
npm run export-demo
git add src/lib/demo-data.ts && git commit -m "Update demo data"
```

## 🏗 Продакшен (Hetzner VPS + PM2)

```bash
npm run build
pm2 start ecosystem.config.js
```

Деплой обновлений на сервере: `./deploy.sh` (git pull → npm ci → build → pm2 restart).

### Миграция контента на сервер

Контент — это файл SQLite и загруженные фото. Копируется напрямую:

```bash
scp data/guesthouse.db user@server:/path/to/project/data/
scp -r public/uploads/ user@server:/path/to/project/public/
```

## 📁 Структура проекта

```
├── public/           # Статические файлы
│   ├── flags/        # Флаги языков
│   ├── images/       # Изображения (галерея, фон)
│   └── uploads/      # Загруженные фото домиков
├── scripts/
│   └── export-demo.mjs  # Экспорт БД → demo-data.ts
├── src/
│   ├── app/          # Next.js App Router
│   │   └── api/      # API эндпоинты (rooms, reviews, settings, upload, admin, init)
│   ├── components/   # React компоненты (+ admin/, ui/)
│   ├── hooks/        # React хуки
│   ├── lib/          # Утилиты, БД, i18n
│   └── __tests__/    # Тесты Vitest
├── data/             # SQLite база (создаётся автоматически, в .gitignore)
├── .env.example      # Пример конфигурации
└── ecosystem.config.js  # Конфигурация PM2
```

## 🔧 Доступные скрипты

| Скрипт | Описание |
|--------|----------|
| `npm run dev` | Запуск в режиме разработки |
| `npm run build` | Сборка для продакшена |
| `npm start` | Запуск продакшен сборки |
| `npm run lint` | Проверка ESLint |
| `npm test` | Запуск тестов |
| `npm run export-demo` | Экспорт БД в demo-data.ts для Vercel |

## 📝 Лицензия

Частный проект. Все права защищены.

## 👤 Автор

Guest House Ivanovka Team
