import { NextResponse } from 'next/server'
import { verifyPassword, generateAdminToken } from '@/lib/middleware'

// In-memory rate limiting for login attempts (per IP).
// 5 failed attempts → 15 min lockout. Resets on server restart — fine for single-admin VPS.
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000

interface AttemptRecord {
  count: number
  lockedUntil: number
}

const globalForRateLimit = globalThis as unknown as {
  authAttempts: Map<string, AttemptRecord> | undefined
}
const attempts = (globalForRateLimit.authAttempts ??= new Map<string, AttemptRecord>())

function getClientKey(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  return fwd?.split(',')[0].trim() || 'unknown'
}

function isLocked(key: string): boolean {
  const rec = attempts.get(key)
  if (!rec) return false
  if (rec.lockedUntil > Date.now()) return true
  if (rec.lockedUntil !== 0) attempts.delete(key) // lockout expired
  return false
}

function recordFailure(key: string) {
  const rec = attempts.get(key) ?? { count: 0, lockedUntil: 0 }
  rec.count += 1
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockedUntil = Date.now() + LOCKOUT_MS
    rec.count = 0
  }
  attempts.set(key, rec)
}

// Admin authentication endpoint
export async function POST(request: Request) {
  try {
    const clientKey = getClientKey(request)

    if (isLocked(clientKey)) {
      return NextResponse.json(
        { success: false, error: 'Слишком много попыток. Попробуйте через 15 минут' },
        { status: 429 }
      )
    }

    const { password } = await request.json()

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Неверный пароль' },
        { status: 401 }
      )
    }

    const correctPassword = process.env.ADMIN_PASSWORD
    if (!correctPassword) {
      console.error('[Auth Error] ADMIN_PASSWORD is not configured')
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
    }

    if (!verifyPassword(password, correctPassword)) {
      recordFailure(clientKey)
      return NextResponse.json({ success: false, error: 'Неверный пароль' }, { status: 401 })
    }

    attempts.delete(clientKey)
    const token = generateAdminToken()

    return NextResponse.json({ success: true, token })
  } catch (error) {
    console.error('[Auth Error]', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Ошибка авторизации' }, { status: 500 })
  }
}
