// Smoke-тест всех API против запущенного сервера (лучше продакшен-сборки).
// Запуск: node scripts/smoke-test.mjs [baseUrl]   (по умолчанию http://localhost:3000)
// Читает ADMIN_PASSWORD из .env для тестов админки.

import { readFileSync } from 'fs'

const base = process.argv[2] || 'http://localhost:3000'

let adminPassword = ''
try {
  const env = readFileSync('.env', 'utf8')
  const m = env.match(/ADMIN_PASSWORD="?([^"\r\n]+)"?/)
  adminPassword = m?.[1] ?? ''
} catch {
  console.error('⚠️  .env не найден — тесты админки будут пропущены')
}

let passed = 0
let failed = 0

function check(name, cond, detail = '') {
  if (cond) {
    passed++
    console.log(`  ✓ ${name}`)
  } else {
    failed++
    console.log(`  ✗ ${name} ${detail}`)
  }
}

async function api(path, options = {}) {
  const res = await fetch(base + path, options)
  let body = null
  try {
    body = await res.json()
  } catch {
    // not JSON
  }
  return { status: res.status, body }
}

const jsonHeaders = { 'Content-Type': 'application/json' }

console.log(`\n🔍 Smoke-тест: ${base}\n`)

// ---------- Публичные GET ----------
console.log('Публичные эндпоинты:')
const rooms = await api('/api/rooms')
check('GET /api/rooms → 200 + массив', rooms.status === 200 && Array.isArray(rooms.body))
check('  2 дома', Array.isArray(rooms.body) && rooms.body.length === 2, `(got ${rooms.body?.length})`)
check(
  '  у домов есть bookingUrl и фото',
  Array.isArray(rooms.body) &&
    rooms.body.every((r) => typeof r.bookingUrl === 'string' && r.bookingUrl.startsWith('http') && Array.isArray(r.images) && r.images.length > 0)
)

const reviews = await api('/api/reviews')
check('GET /api/reviews → 200 + массив', reviews.status === 200 && Array.isArray(reviews.body))
check(
  '  только одобренные',
  Array.isArray(reviews.body) && reviews.body.every((r) => r.isApproved !== false)
)

const settings = await api('/api/settings')
check('GET /api/settings → 200 + телефон', settings.status === 200 && !!settings.body?.phone)

// ---------- Безопасность без токена ----------
console.log('\nБез токена (ожидаем 401):')
const noAuth = [
  ['PUT /api/rooms', await api('/api/rooms', { method: 'PUT', headers: jsonHeaders, body: '{}' })],
  ['POST /api/rooms', await api('/api/rooms', { method: 'POST', headers: jsonHeaders, body: '{}' })],
  ['DELETE /api/rooms', await api('/api/rooms?id=x', { method: 'DELETE' })],
  ['PUT /api/settings', await api('/api/settings', { method: 'PUT', headers: jsonHeaders, body: '{}' })],
  ['POST /api/upload', await api('/api/upload', { method: 'POST', body: new FormData() })],
  ['DELETE /api/upload', await api('/api/upload?url=/uploads/x.jpg', { method: 'DELETE' })],
  ['GET /api/reviews?all=true', await api('/api/reviews?all=true')],
  ['POST /api/init', await api('/api/init', { method: 'POST' })],
]
for (const [name, r] of noAuth) {
  check(`${name} → 401`, r.status === 401, `(got ${r.status})`)
}

// ---------- Админка ----------
if (!adminPassword) {
  console.log('\n⚠️  ADMIN_PASSWORD не найден в .env — пропускаю тесты админки')
} else {
  console.log('\nАвторизация:')
  const wrongLogin = await api('/api/admin/auth', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ password: 'definitely-wrong-password' }),
  })
  check('неверный пароль → 401', wrongLogin.status === 401, `(got ${wrongLogin.status})`)

  const login = await api('/api/admin/auth', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ password: adminPassword }),
  })
  const token = login.body?.token
  check('верный пароль → 200 + токен', login.status === 200 && typeof token === 'string' && token.length > 0)

  if (token) {
    const auth = { 'x-admin-token': token }
    const authJson = { ...jsonHeaders, 'x-admin-token': token }

    console.log('\nАдминка с токеном:')
    const allReviews = await api('/api/reviews?all=true', { headers: auth })
    check('GET /api/reviews?all=true → 200 + массив', allReviews.status === 200 && Array.isArray(allReviews.body))

    // PUT room — пересохранение без изменений
    const room = rooms.body[0]
    const putRoom = await api('/api/rooms', {
      method: 'PUT',
      headers: authJson,
      body: JSON.stringify({ id: room.id, price: room.price }),
    })
    check('PUT /api/rooms (без изменений) → 200, цена та же', putRoom.status === 200 && putRoom.body?.price === room.price)

    // Отзыв: публичный POST с isApproved=true отклоняется (401)
    const sneaky = await api('/api/reviews', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ guestName: 'SMOKE TEST', rating: 5, comment: 'test', isApproved: true }),
    })
    check('POST /api/reviews с isApproved=true без токена → 401', sneaky.status === 401, `(got ${sneaky.status})`)

    // Обычный публичный отзыв создаётся НЕодобренным
    const pubReview = await api('/api/reviews', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ guestName: 'SMOKE TEST', rating: 5, comment: 'test' }),
    })
    check('POST /api/reviews без токена → 201, неодобрен', pubReview.status === 201 && pubReview.body?.isApproved === false)

    // Удалить тестовый отзыв
    if (pubReview.body?.id) {
      const del = await api(`/api/reviews?id=${pubReview.body.id}`, { method: 'DELETE', headers: auth })
      check('DELETE /api/reviews с токеном → 200', del.status === 200)
    }

    // Upload: 1x1 PNG
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    )
    const form = new FormData()
    form.append('file', new Blob([png], { type: 'image/png' }), 'smoke-test.png')
    const upload = await api('/api/upload', { method: 'POST', headers: auth, body: form })
    check('POST /api/upload (1x1 png) → 200 + /api/files/ url', upload.status === 200 && typeof upload.body?.url === 'string' && upload.body.url.startsWith('/api/files/'))

    if (upload.body?.url) {
      const fileRes = await fetch(base + upload.body.url)
      check('  файл доступен по url', fileRes.status === 200, `(got ${fileRes.status})`)
      const delUpload = await api(`/api/upload?url=${encodeURIComponent(upload.body.url)}`, { method: 'DELETE', headers: auth })
      check('DELETE /api/upload → 200', delUpload.status === 200)
    }

    // Невалидный bookingUrl должен быть отклонён
    const badUrl = await api('/api/rooms', {
      method: 'PUT',
      headers: authJson,
      body: JSON.stringify({ id: room.id, bookingUrl: 'not-a-url' }),
    })
    check('PUT /api/rooms с кривым bookingUrl → 400', badUrl.status === 400, `(got ${badUrl.status})`)
  }

  // ---------- Рейт-лимит (отдельный IP, чтобы не блокировать основной) ----------
  console.log('\nРейт-лимит авторизации:')
  const rlHeaders = { ...jsonHeaders, 'x-forwarded-for': '10.9.9.9' }
  let lastStatus = 0
  for (let i = 0; i < 6; i++) {
    const r = await api('/api/admin/auth', {
      method: 'POST',
      headers: rlHeaders,
      body: JSON.stringify({ password: 'brute-force-attempt' }),
    })
    lastStatus = r.status
  }
  check('6-я попытка подбора → 429', lastStatus === 429, `(got ${lastStatus})`)
}

console.log(`\n${failed === 0 ? '✅' : '❌'} Итог: ${passed} passed, ${failed} failed\n`)
process.exit(failed === 0 ? 0 : 1)
