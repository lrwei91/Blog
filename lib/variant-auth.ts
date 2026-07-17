import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto"

/**
 * Variant Cookie 签名与 accessCode 哈希工具
 *
 * 2026-07-17 P0 安全修复：
 * - variant Cookie 不再明文存储 variantId/remaining，改为 HMAC 签名
 * - accessCode 不再明文存入公共 Blob，改为 SHA-256 哈希
 */

const MIN_SECRET_LENGTH = 32
const VARIANT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 天，与原 Cookie maxAge 一致

function getSecret(): string {
  const secret = process.env.SESSION_SECRET || ""
  if (secret.length >= MIN_SECRET_LENGTH) {
    return secret
  }
  const credentialSecret = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || ""
  if (!credentialSecret) {
    throw new Error("Cannot derive variant cookie secret: set SESSION_SECRET or ADMIN_PASSWORD")
  }
  return createHash("sha256").update(`variant-cookie:${credentialSecret}`).digest("hex")
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url")
}

function sign(body: string): string {
  return createHmac("sha256", getSecret()).update(body).digest("base64url")
}

// ── Variant Cookie 签名 ──

export function signVariantCookie(variantId: string, remaining: number, expiresAt: number): string {
  const nonce = randomBytes(8).toString("hex")
  const body = base64url(JSON.stringify({ variantId, remaining, expiresAt, nonce }))
  return `${body}.${sign(body)}`
}

export type VerifiedVariantCookie = {
  variantId: string
  remaining: number
  expiresAt: number
}

export function verifyVariantCookie(cookieValue: string | undefined): VerifiedVariantCookie | null {
  if (!cookieValue) return null

  const [body, signature] = cookieValue.split(".")
  if (!body || !signature) return null

  const expected = sign(body)
  const expectedBuffer = Buffer.from(expected)
  const actualBuffer = Buffer.from(signature)
  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      variantId?: string
      remaining?: number
      expiresAt?: number
    }
    if (typeof payload.variantId !== "string" || typeof payload.remaining !== "number" || typeof payload.expiresAt !== "number") {
      return null
    }
    if (payload.expiresAt <= Math.floor(Date.now() / 1000)) return null
    if (payload.remaining <= 0) return null
    return { variantId: payload.variantId, remaining: payload.remaining, expiresAt: payload.expiresAt }
  } catch {
    return null
  }
}

export function getVariantCookieMaxAge(): number {
  return VARIANT_COOKIE_MAX_AGE
}

export function getVariantCookieExpiresAt(): number {
  return Math.floor(Date.now() / 1000) + VARIANT_COOKIE_MAX_AGE
}

// ── accessCode 哈希 ──

export function hashAccessCode(plain: string): string {
  return createHash("sha256").update(`access-code:${plain.trim().toLowerCase()}`).digest("hex")
}

/**
 * 比对 accessCode：支持新的哈希模式和旧的明文模式（向后兼容）
 */
export function matchAccessCode(input: string, variant: { accessCode: string; accessCodeHash?: string }): boolean {
  const normalizedInput = input.trim().toLowerCase()
  if (!normalizedInput) return false

  // 新模式：哈希比对
  if (variant.accessCodeHash) {
    return timingSafeEqual(
      Buffer.from(variant.accessCodeHash),
      Buffer.from(hashAccessCode(normalizedInput))
    )
  }

  // 旧模式：明文比对（向后兼容，读取后应迁移为 hash）
  return variant.accessCode.trim().toLowerCase() === normalizedInput
}
