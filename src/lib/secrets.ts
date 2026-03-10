import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

const ENCRYPTED_PREFIX = "enc:v1:";
const PASSWORD_HASH_PREFIX = "pwd:v1:";

function getAppSecret() {
  const secret = process.env.APP_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV !== "production") {
    return "pickme-local-dev-secret";
  }

  throw new Error("APP_SECRET is required in production.");
}

function getKey() {
  return createHash("sha256").update(getAppSecret()).digest();
}

function toBuffer(value: string) {
  return Buffer.from(value, "base64url");
}

function encode(value: Buffer) {
  return value.toString("base64url");
}

export function isEncryptedValue(value: string) {
  return value.startsWith(ENCRYPTED_PREFIX);
}

export function encryptSecretValue(value: string) {
  if (!value) return "";

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${ENCRYPTED_PREFIX}${encode(iv)}.${encode(tag)}.${encode(encrypted)}`;
}

export function decryptSecretValue(value: string) {
  if (!value) return "";
  if (!isEncryptedValue(value)) return value;

  const payload = value.slice(ENCRYPTED_PREFIX.length);
  const [ivEncoded, tagEncoded, encryptedEncoded] = payload.split(".");
  if (!ivEncoded || !tagEncoded || !encryptedEncoded) {
    throw new Error("Encrypted secret payload is invalid.");
  }

  const decipher = createDecipheriv("aes-256-gcm", getKey(), toBuffer(ivEncoded));
  decipher.setAuthTag(toBuffer(tagEncoded));

  const decrypted = Buffer.concat([
    decipher.update(toBuffer(encryptedEncoded)),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function secureCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function createSignedToken(scope: string, value: string) {
  return createHmac("sha256", getAppSecret()).update(`${scope}:${value}`).digest("base64url");
}

export function isPasswordHash(value: string) {
  return value.startsWith(PASSWORD_HASH_PREFIX);
}

export function hashPassword(value: string) {
  if (!value) return "";
  if (isPasswordHash(value)) return value;

  const salt = randomBytes(16);
  const derived = scryptSync(value, salt, 64);
  return `${PASSWORD_HASH_PREFIX}${encode(salt)}.${encode(derived)}`;
}

export function verifyPasswordHash(value: string, hash: string) {
  if (!value || !hash) return false;
  if (!isPasswordHash(hash)) return secureCompare(value, hash);

  const payload = hash.slice(PASSWORD_HASH_PREFIX.length);
  const [saltEncoded, derivedEncoded] = payload.split(".");
  if (!saltEncoded || !derivedEncoded) return false;

  const salt = toBuffer(saltEncoded);
  const expected = toBuffer(derivedEncoded);
  const candidate = scryptSync(value, salt, expected.length);

  return secureCompare(encode(candidate), encode(expected));
}
