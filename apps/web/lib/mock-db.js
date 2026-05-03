// Shared in-memory store for API routes
// Note: This resets on server restart

export const users = new Map();

export function generateToken(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}
