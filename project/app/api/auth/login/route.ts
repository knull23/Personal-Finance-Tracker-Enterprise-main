// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from "bcryptjs";
import { signJwt } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db('finance-tracker');

    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = signJwt({ uid: user._id.toString(), email: user.email, name: user.name });

    const secure = process.env.NODE_ENV === 'production';
    const maxAge = 7 * 24 * 60 * 60;
    const cookie = `ft_token=${token}; Path=/; HttpOnly; Max-Age=${maxAge}; SameSite=Lax${
      secure ? '; Secure' : ''
    }`;

    return NextResponse.json(
      { ok: true, user: { id: user._id.toString(), name: user.name, email: user.email } },
      { status: 200, headers: { 'Set-Cookie': cookie } }
    );
  } catch (err) {
    console.error('Login error', err);
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
