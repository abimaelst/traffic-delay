import dotenv from 'dotenv';
dotenv.config();

import sgMail, { MailDataRequired } from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'support@traffic.com';

if (!SENDGRID_API_KEY || !FROM_EMAIL) {
  throw new Error('Missing SENDGRID_API_KEY or FROM_EMAIL in .env');
}

sgMail.setApiKey(SENDGRID_API_KEY);

export async function sendEmail(to: string, message: string): Promise<void> {
  const msg: MailDataRequired = {
    to,
    from: FROM_EMAIL,
    subject: 'Delivery Delay Notification',
    text: message,
  };

  try {
    await sgMail.send(msg);
    console.log(`📨 Email sent to ${to}`);
  } catch (err: any) {
    console.error('❌ Failed to send email:', err.response?.body || err.message);
    throw new Error('SendGrid email failed');
  }
}