import crypto from "crypto";

// Auth tokens are high-entropy random strings. Only their SHA-256 hash is
// persisted, so a database leak cannot be replayed as a valid token.
export function generateAuthToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashAuthToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
