import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export const sendEmail = async ({ to, subject, html }) => {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    if (env.isProduction) {
      throw new Error('SMTP configuration is required to send email in production.');
    }
    console.warn(`Email skipped in development. To: ${to}. Subject: ${subject}`);
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });

  return transporter.sendMail({
    from: env.mailFrom,
    to,
    subject,
    html
  });
};
