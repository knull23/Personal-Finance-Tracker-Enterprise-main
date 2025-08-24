// lib/mailer.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(to: string, name: string) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com';
  await transporter.sendMail({
    from,
    to,
    subject: 'Welcome to FinanceTracker!',
    text: `Hi ${name},\n\nWelcome to FinanceTracker! Your account has been created successfully.\n\n— FinanceTracker Team`,
    html: `<p>Hi <strong>${name}</strong>,</p><p>Welcome to <strong>FinanceTracker</strong>! Your account has been created successfully.</p><p>— FinanceTracker Team</p>`,
  });
}
