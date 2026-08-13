import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Admin token expiry: 1 hour
 */
const ADMIN_TOKEN_EXPIRY_MS = 1000 * 60 * 60

/**
 * Verify admin authentication token
 * Simplified HMAC-SHA256 verification (no timing-safe comparison needed for single-admin VPS)
 */
export function verifyAdminToken(token: string | null): boolean {
  if (!token) return false

  // Support static token from env (for API automation)
  const expectedStaticToken = process.env.ADMIN_TOKEN
  if (expectedStaticToken && token === expectedStaticToken) {
    return true
  }

  // HMAC-based dynamic token
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) return false

  const [timestampStr, signature] = token.split('.')
  if (!timestampStr || !signature) return false

  const timestamp = Number(timestampStr)
  if (Number.isNaN(timestamp) || Date.now() - timestamp > ADMIN_TOKEN_EXPIRY_MS) {
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(timestampStr)
    .digest('hex')

  return signature === expectedSignature
}

/**
 * Verify admin password
 */
export function verifyPassword(inputPassword: string, correctPassword: string): boolean {
  return inputPassword === correctPassword
}

/**
 * Generate admin token (HMAC-SHA256)
 */
export function generateAdminToken(): string {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) {
    throw new Error('ADMIN_PASSWORD environment variable is required')
  }
  const timestamp = Date.now().toString()
  const signature = crypto.createHmac('sha256', secret).update(timestamp).digest('hex')
  return `${timestamp}.${signature}`
}

/**
 * Extract auth token from request headers
 */
export function getAuthTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim()
  }
  return request.headers.get('x-admin-token')
}

/**
 * Middleware wrapper to require admin authentication
 */
export function withAdminAuth(
  handler: (request: NextRequest) => Promise<Response>
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest) => {
    const token = getAuthTokenFromRequest(request)

    if (!verifyAdminToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin token required' },
        { status: 401 }
      )
    }

    return handler(request)
  }
}

/**
 * Input validation utilities
 */
export const validateInput = {
  room: (data: Record<string, unknown>) => {
    const errors: string[] = []

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Room name is required')
    }
    if (data.name && typeof data.name === 'string' && data.name.length > 200) {
      errors.push('Room name must be under 200 characters')
    }

    if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
      errors.push('Room description is required')
    }

    const price = parseFloat(String(data.price || 0))
    if (isNaN(price) || price < 0 || price > 100000) {
      errors.push('Room price must be between 0 and 100000')
    }

    const capacity = parseInt(String(data.capacity || 2))
    if (isNaN(capacity) || capacity < 1 || capacity > 50) {
      errors.push('Room capacity must be between 1 and 50 guests')
    }

    if (data.bookingUrl !== undefined && data.bookingUrl !== '') {
      const url = String(data.bookingUrl)
      if (!/^https?:\/\/.+/.test(url) || url.length > 500) {
        errors.push('Booking URL must be a valid http(s) URL')
      }
    }

    return { isValid: errors.length === 0, errors }
  },

  review: (data: Record<string, unknown>) => {
    const errors: string[] = []

    if (!data.guestName || typeof data.guestName !== 'string' || data.guestName.trim().length === 0) {
      errors.push('Guest name is required')
    }
    if (data.guestName && typeof data.guestName === 'string' && data.guestName.length > 100) {
      errors.push('Guest name must be under 100 characters')
    }

    const rating = parseInt(String(data.rating || 0))
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.push('Rating must be between 1 and 5')
    }

    if (!data.comment || typeof data.comment !== 'string' || data.comment.trim().length === 0) {
      errors.push('Comment is required')
    }
    if (data.comment && typeof data.comment === 'string' && data.comment.length > 1000) {
      errors.push('Comment must be under 1000 characters')
    }

    return { isValid: errors.length === 0, errors }
  },

  settings: (data: Record<string, unknown>) => {
    const errors: string[] = []

    if (!data.phone || typeof data.phone !== 'string' || data.phone.trim().length === 0) {
      errors.push('Phone is required')
    }
    if (data.phone && typeof data.phone === 'string' && data.phone.length > 50) {
      errors.push('Phone must be under 50 characters')
    }

    if (data.email && typeof data.email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (data.email && !emailRegex.test(data.email)) {
        errors.push('Invalid email format')
      }
    }

    if (data.address && typeof data.address === 'string' && data.address.length > 200) {
      errors.push('Address must be under 200 characters')
    }

    if (data.description && typeof data.description === 'string' && data.description.length > 1000) {
      errors.push('Description must be under 1000 characters')
    }

    return { isValid: errors.length === 0, errors }
  },
}

/**
 * Sanitization utilities
 */
export function isValidId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function sanitizeBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }
  return false
}

export const sanitize = {
  text: (input: string): string => {
    if (typeof input !== 'string') return ''
    return input
      .trim()
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=\s*/gi, '')
      .slice(0, 1000)
  },

  email: (input: string): string => {
    if (typeof input !== 'string') return ''
    return input.trim().toLowerCase().slice(0, 100)
  },

  phone: (input: string): string => {
    if (typeof input !== 'string') return ''
    return input.trim().slice(0, 50)
  },
}
