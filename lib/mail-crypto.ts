import crypto from "node:crypto";

function key() {
  const secret = process.env.MAILBOX_ENCRYPTION_KEY;
  if (!secret || secret.length < 32) throw new Error("MAILBOX_ENCRYPTION_KEY must be at least 32 characters.");
  return crypto.createHash("sha256").update(secret).digest();
}
export function encrypt(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((x) => x.toString("base64url")).join(".");
}
export function decrypt(value: string) {
  const [iv, tag, data] = value.split(".").map((x) => Buffer.from(x, "base64url"));
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
export function signedState(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, expires: Date.now() + 10 * 60_000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", key()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}
export function verifyState(state: string) {
  const [payload, signature] = state.split(".");
  const expected = crypto.createHmac("sha256", key()).update(payload).digest("base64url");
  if (!signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error("Invalid OAuth state.");
  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString()) as { userId: string; expires: number };
  if (decoded.expires < Date.now()) throw new Error("OAuth state expired.");
  return decoded;
}
