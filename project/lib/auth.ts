// lib/auth.ts
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'replace-me-with-a-strong-secret';

export function signJwt(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (err) {
    return null;
  }
}

/**
 * Reads the ft_token cookie from a NextRequest and returns the decoded token payload
 * or null if not present / invalid.
 */
export function getUserFromRequest(req: NextRequest) {
  const cookie = req.cookies.get?.('ft_token')?.value;
  if (!cookie) return null;
  const data = verifyJwt(cookie);
  return data || null;
}
