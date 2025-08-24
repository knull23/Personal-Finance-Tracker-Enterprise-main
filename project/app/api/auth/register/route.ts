// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from "bcryptjs";
import { signJwt } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body ?? {};

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('finance-tracker');

    const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();
    const result = await db.collection('users').insertOne({
      name,
      email: email.toLowerCase(),
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    const userId = result.insertedId.toString();

    // Generate token and set cookie
    const token = signJwt({ uid: userId, email: email.toLowerCase(), name });

    const secure = process.env.NODE_ENV === 'production';
    const maxAge = 7 * 24 * 60 * 60; // 7 days
    const cookie = `ft_token=${token}; Path=/; HttpOnly; Max-Age=${maxAge}; SameSite=Lax${
      secure ? '; Secure' : ''
    }`;

    // Fire-and-forget welcome email
    sendWelcomeEmail(email, name).catch((err) => console.error('Welcome email failed:', err));

    return NextResponse.json(
      { ok: true, user: { id: userId, name, email: email.toLowerCase() } },
      { status: 201, headers: { 'Set-Cookie': cookie } }
    );
  } catch (err) {
    console.error('Register error', err);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}
