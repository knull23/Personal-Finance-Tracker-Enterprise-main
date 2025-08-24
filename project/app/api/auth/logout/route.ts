// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  const secure = process.env.NODE_ENV === 'production';
  // expire cookie
  const cookie = `ft_token=deleted; Path=/; HttpOnly; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${
    secure ? '; Secure' : ''
  }`;

  return NextResponse.json({ ok: true }, { status: 200, headers: { 'Set-Cookie': cookie } });
}
