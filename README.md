# Guest House Ivanovka

Уютные гостевые дома в горах Азербайджана (Исмаиллы, посёлок Ивановка). Информационный сайт с бронированием через WhatsApp и административной панелью для управления контентом.

**Продакшен-домен:** `https://roomguesthouse.com`

---

## 🛠 Технологии

| Слой | Технология |
|------|------------|
| Фреймворк | Next.js 16 (App Router, Turbopack), `output: "standalone"` |
| Язык | TypeScript |
| UI | React 19, Tailwind CSS 4, shadcn/ui, lucide-react |
| База данных | SQLite через `better-sqlite3` (файл `data/guesthouse.db`) |
| Тесты | Vitest |
| Процесс-менеджер | PM2 (fork, 1 инстанс) |
| Веб-сервер | Nginx (reverse proxy) |
| CDN/DNS/SSL | Cloudflare |
| CI/CD | GitHub Actions (автодеплой при push в `main`) |

---

## 🏗 Архитектура

### Как устроен контент

Весь редактируемый контент хранится в **SQLite** (файл `data/guesthouse.db`, в `.gitignore`). Таблицы:

| Таблица | Назначение |
|---------|-----------|
| `Room` | Домики: название, описание, цена, вместимость, удобства, фото, bookingUrl |
| `Review` | Отзывы гостей (модерация через `isApproved`) |
| `SiteSettings` | Телефон, email, адрес, описание сайта |

Ключевые особенности:

- **Мультиязычность RU/AZ/EN.** Поля `name`, `description`, `conditions` хранятся как JSON-строка вида `{"ru":"...","az":"...","en":"..."}`. Поля `advantages`, `amenities`, `images` — как JSON-массивы в TEXT. Парсинг/сериализацию см. `src/lib/schema.ts`.
- **Фото домиков** живут в `public/images/` (в git). Фото, загруженные через админку, — в `public/uploads/` и отдаются динамически через `/api/files/[filename]` (важно: в продакшене Next.js не отдаёт файлы из `public/`, появившиеся после сборки, поэтому загрузки идут через API-роут).
- **WAL-режим** включён. Рядом с БД могут лежать `guesthouse.db-wal` и `guesthouse.db-shm` — это нормально.

### API-эндпоинты (`src/app/api/`)

| Маршрут | Методы | Доступ |
|---------|--------|--------|
| `/api/rooms` | GET (публичный), POST/PUT/DELETE (админ) | — |
| `/api/reviews` | GET, POST (публичный); GET `?all=true`, DELETE (админ) | — |
| `/api/settings` | GET (публичный), PUT (админ) | — |
| `/api/upload` | POST/DELETE (админ) | загрузка/удаление фото |
| `/api/files/[filename]` | GET | отдача загруженных фото |
| `/api/admin/auth` | POST | вход в админку (выдаёт токен) |
| `/api/init` | POST (админ) | наполнение пустой БД demo-данными |

### Аутентификация админки

- Пароль из `ADMIN_PASSWORD` (`.env`).
- Клиент отправляет пароль в `/api/admin/auth`, получает HMAC-SHA256 токен со сроком 1 час.
- Дальше токен передаётся в заголовке `x-admin-token` (или `Authorization: Bearer ...`).
- Логика в `src/lib/middleware.ts`: `verifyAdminToken`, `verifyPassword`, `generateAdminToken`, `withAdminAuth`, валидация и санитайзинг.
- Рейт-лимит на неудачные попытки входа: 5 провалов → блокировка на 15 минут (in-memory, в `src/app/api/admin/auth/route.ts`).

### Вход в админку на сайте

Нажмите **Ctrl+Shift+A** на клавиатуре → введите пароль администратора.

---

## 📁 Структура проекта

```
├── public/               # Статика
│   ├── flags/            # Флаги языков
│   ├── images/           # Фото домиков и фоны (в git)
│   │   ├── bg/           # Фоны (генерируется sync-content)
│   │   ├── micheli/      # Фото домика Micheli's
│   │   ├── miran/        # Фото домика Miran's
│   │   └── okrestnosti/  # Галерея окрестностей
│   └── uploads/          # Загруженные через админку фото (в git)
├── scripts/
│   ├── export-demo.mjs   # Экспорт БД → src/lib/demo-data.ts (демо)
│   ├── sync-content.mjs  # Синк content/ → public/images + манифест
│   └── smoke-test.mjs    # Smoke-тест API
├── src/
│   ├── app/              # Next.js App Router (страницы + API)
│   ├── components/       # React-компоненты (+ admin/, ui/)
│   ├── hooks/            # Кастомные хуки
│   ├── lib/              # БД, i18n, типы, утилиты
│   └── __tests__/        # Тесты Vitest
├── data/                 # SQLite БД (создаётся автоматически, в .gitignore)
├── content/              # Локальный источник фото (в .gitignore)
├── ecosystem.config.js   # Конфигурация PM2
├── deploy.sh             # Ручной деплой (git pull → npm ci → build → pm2)
└── .github/workflows/deploy.yml  # Автодеплой (GitHub Actions)
```

---

## 🚀 Локальная разработка

### Требования

- Node.js 18+ (рекомендуется 22 LTS)
- npm

### Установка и запуск

```bash
git clone https://github.com/SeymurKh/GuestHouse-Ivanovka.git
cd GuestHouse-Ivanovka
npm install
cp .env.example .env   # или copy .env.example .env (Windows)
# в .env задайте ADMIN_PASSWORD
npm run dev
```

Откройте `http://localhost:3000`.

БД создаётся автоматически при первом запуске. Для наполнения пустой БД начальными данными:

```bash
# POST /api/init с админ-токеном (данные из src/lib/demo-data.ts)
```

### Полезные команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер |
| `npm run build` | Продакшен-сборка |
| `npm start` | Запуск прод-сборки |
| `npm test` | Запуск тестов Vitest |
| `npm run lint` | ESLint |
| `npm run export-demo` | Экспорт SQLite → `demo-data.ts` |
| `npm run sync-content` | Синк фото из `content/` + манифест |
| `node scripts/smoke-test.mjs [baseUrl]` | Smoke-тест API |

---

## 🌍 Демо-режим (Vercel, без БД)

Для статического хостинга без SQLite включите:

```
NEXT_PUBLIC_DEMO_MODE="true"
```

Тогда данные берутся из `src/lib/demo-data.ts` (автогенерируемый — не редактировать вручную).

После правок контента через админку обновляйте демо-данные:

```bash
npm run export-demo
git add src/lib/demo-data.ts && git commit -m "Update demo data"
```

---

## 🏭 Продакшен (Hetzner VPS + PM2 + Nginx + Cloudflare)

### Архитектура продакшена

```
Пользователь
    ↓ HTTPS
Cloudflare (DNS, CDN, SSL-терминация)
    ↓ HTTPS (443)
Nginx (reverse proxy)  — /etc/nginx/sites-enabled/guesthouse.conf
    ↓ HTTP (127.0.0.1:3000)
Next.js (PM2, приложение guesthouse)
    ↓
SQLite (data/guesthouse.db)
```

### Сервер

- **Путь проекта:** `/opt/guesthouse`
- **Скрипт деплоя:** `/opt/deploy-guesthouse.sh`
- **Реальный `.env`:** `/opt/guesthouse.env` (дубликат вне репозитория, переживает `git reset --hard`)
- **SSL-сертификат:** `/etc/nginx/ssl/origin.crt` + `/etc/nginx/ssl/origin.key`

### Ручной деплой

```bash
ssh root@<IP>
cd /opt/guesthouse && ./deploy.sh
```

### Автодеплой (GitHub Actions)

При **push в ветку `main`** workflow `.github/workflows/deploy.yml` подключается к серверу по SSH и запускает `/opt/deploy-guesthouse.sh`:

```
git fetch origin main → git reset --hard origin/main
→ восстановление .env из /opt/guesthouse.env
→ npm ci → npm run build
→ pm2 restart guesthouse → pm2 save
```

**Секреты GitHub Actions** (Settings → Secrets → Actions):

| Секрет | Значение |
|--------|----------|
| `HOST` | IP-адрес сервера |
| `USERNAME` | `root` |
| `SSH_PRIVATE_KEY` | Приватный ключ, публичная часть которого лежит в `~/.ssh/authorized_keys` на сервере |

### Полезные команды на сервере

```bash
pm2 status                  # статус приложения
pm2 logs guesthouse         # логи
pm2 restart guesthouse      # рестарт
nginx -t                    # проверка конфига nginx
systemctl reload nginx      # применить конфиг nginx
```

---

## 🔐 SSL и Cloudflare

- Домен: `roomguesthouse.com` (куплен на Namecheap, DNS переведён на Cloudflare).
- Cloudflare SSL/TLS режим: **Full (strict)**.
- На origin-сервере (Nginx) стоит **Cloudflare Origin Certificate** (`/etc/nginx/ssl/origin.crt`), подписанный Cloudflare Origin CA.
- DNS-записи в Cloudflare: A `@` и A `www` → IP сервера, обе **Proxied** (оранжевое облако).

> ⚠️ Если Cloudflare стоит в режиме **Full (strict)**, origin должен отдавать сертификат Cloudflare Origin CA, иначе Cloudflare вернёт **ошибку 526**. Обычный self-signed сертификат под Full (strict) НЕ подойдёт.

---

## 🗄 Миграция контента на сервер

Контент = файл SQLite + загруженные фото:

```bash
# 1. Локально сделайте консистентный снапшот БД (учитывает WAL):
python -c "import sqlite3; s=sqlite3.connect('data/guesthouse.db'); d=sqlite3.connect('/tmp/guesthouse.db'); s.backup(d)"

# 2. Скопируйте БД и фото:
scp /tmp/guesthouse.db root@<IP>:/opt/guesthouse/data/guesthouse.db
scp -r public/uploads/ root@<IP>:/opt/guesthouse/public/
```

Примечание: ручной перенос БД нужен только при первом развёртывании или переносе уникального контента. Автодеплой БД не трогает — он только тянет код и пересобирает приложение.

---

## ⚙️ Переменные окружения

Файл `.env` (на сервере — `/opt/guesthouse.env`):

| Переменная | Описание |
|------------|----------|
| `ADMIN_PASSWORD` | Пароль для входа в админ-панель (обязательно) |
| `ADMIN_TOKEN` | *(опц.)* Статический токен для API-автоматизации |
| `NEXT_PUBLIC_DEMO_MODE` | `true` — демо-режим без БД (Vercel), `false` — обычный SQLite |

В репозитории `.env` не хранится (в `.gitignore`), закоммичен только `.env.example`.

---

## 🖼 Синхронизация фото (`sync-content`)

Локальный источник фото лежит в `content/` (НЕ в git). Скрипт копирует их в `public/images/` и обновляет записи домиков в БД:

```bash
npm run sync-content
```

Маппинг папок задан в `scripts/sync-content.mjs`:
- `content/bckgrnd` → `public/images/bg`
- `content/Micheli`s` → `public/images/micheli`
- `content/Miran`s` → `public/images/miran`
- `content/Okrestnosti` → `public/images/okrestnosti`

---

## 🧪 Тестирование

```bash
npm test                                # юнит-тесты (Vitest)
node scripts/smoke-test.mjs http://localhost:3000   # smoke-тест API
```

Smoke-тест проверяет: публичные API, защиту 401 без токена, вход/токен, админ-операции, загрузку/удаление фото, рейт-лимит.

---

## 📝 Лицензия

Частный проект. Все права защищены.