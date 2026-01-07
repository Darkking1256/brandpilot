/**
 * Encryption utility for storing sensitive OAuth credentials
 * Uses AES-256-GCM encryption
 */

import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-change-in-production-min-32-chars-please-change-this"
const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const TAG_POSITION = SALT_LENGTH + IV_LENGTH
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH

/**
 * Derive a 32-byte key from the encryption key using PBKDF2
 */
function getKeyFromPassword(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, "sha512")
}

/**
 * Encrypt text using AES-256-GCM
 */
function encrypt(text: string, key: string): string {
  try {
    const salt = crypto.randomBytes(SALT_LENGTH)
    const iv = crypto.randomBytes(IV_LENGTH)
    const derivedKey = getKeyFromPassword(key, salt)
    
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv)
    let encrypted = cipher.update(text, "utf8")
    encrypted = Buffer.concat([encrypted, cipher.final()])
    const tag = cipher.getAuthTag()
    
    // Combine salt + iv + tag + encrypted
    const combined = Buffer.concat([salt, iv, tag, encrypted])
    return combined.toString("base64")
  } catch (error) {
    throw new Error("Encryption failed")
  }
}

/**
 * Decrypt text using AES-256-GCM
 */
function decrypt(encryptedText: string, key: string): string {
  try {
    const combined = Buffer.from(encryptedText, "base64")
    
    // Extract components
    const salt = combined.slice(0, SALT_LENGTH)
    const iv = combined.slice(SALT_LENGTH, TAG_POSITION)
    const tag = combined.slice(TAG_POSITION, ENCRYPTED_POSITION)
    const encrypted = combined.slice(ENCRYPTED_POSITION)
    
    const derivedKey = getKeyFromPassword(key, salt)
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv)
    decipher.setAuthTag(tag)
    
    let decrypted = decipher.update(encrypted)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    
    return decrypted.toString("utf8")
  } catch (error) {
    throw new Error("Decryption failed: Invalid encrypted data or key")
  }
}

/**
 * Encrypt a client secret before storing in database
 */
export function encryptSecret(secret: string): string {
  if (!secret) return ""
  return encrypt(secret, ENCRYPTION_KEY)
}

/**
 * Decrypt a client secret from database
 */
export function decryptSecret(encryptedSecret: string): string {
  if (!encryptedSecret) return ""
  return decrypt(encryptedSecret, ENCRYPTION_KEY)
}

/**
 * Generate a secure encryption key (run once and add to .env.local)
 * This is a helper function - run it once to generate a key
 */
export function generateEncryptionKey(): string {
  const crypto = require("crypto")
  return crypto.randomBytes(32).toString("hex")
}

