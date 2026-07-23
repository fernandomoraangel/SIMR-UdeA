'use strict';

const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });
    console.log('[Mailer] Configurado con SMTP:', process.env.SMTP_HOST);
  } else {
    transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      ignoreTLS: true,
    });
    console.log('[Mailer] Sin SMTP configurado, usando localhost:1025 (MailHog)');
  }

  return transporter;
}

async function sendMail({ to, subject, html }) {
  const from = process.env.SMTP_FROM || 'noreply@simr.udea.edu.co';

  try {
    const info = await getTransporter().sendMail({ from, to, subject, html });
    console.log('[Mailer] Correo enviado a:', to, 'ID:', info.messageId);
    return info;
  } catch (err) {
    console.error('[Mailer] Error al enviar correo:', err.message);
    throw err;
  }
}

module.exports = { sendMail };
