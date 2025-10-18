// import nodemailer from 'nodemailer';

// const {
//   EMAIL_USER,
//   EMAIL_PASS,
//   SMTP_HOST,
//   SMTP_PORT,
//   SMTP_SECURE,
//   MAIL_FROM,
//   NODE_ENV,
// } = process.env;

// // Helpful boot log (no secrets)
// console.log('[mail] using', SMTP_HOST ? 'custom SMTP' : 'Gmail service');
// console.log('[mail] EMAIL_USER present:', !!EMAIL_USER);
// console.log('[mail] EMAIL_PASS present:', !!(EMAIL_PASS && EMAIL_PASS.trim()));

// // Fail fast if missing
// if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_PASS.trim()) {
//   // Throwing here gives you a clear error on boot instead of a vague EAUTH later
//   throw new Error('[mail] Missing EMAIL_USER and/or EMAIL_PASS (Gmail app password must be set, no spaces)');
// }

// // Build transporter
// let transporter;
// if (SMTP_HOST) {
//   transporter = nodemailer.createTransport({
//     host: SMTP_HOST,
//     port: Number(SMTP_PORT || 587),
//     secure: String(SMTP_SECURE || 'false') === 'true', // true only for 465
//     auth: { user: EMAIL_USER, pass: EMAIL_PASS.trim() },
//   });
// } else {
//   // Gmail: works with 2FA + App Password (paste WITHOUT SPACES)
//   transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: { user: EMAIL_USER, pass: EMAIL_PASS.trim() },
//   });
// }

// export { transporter };

// export async function verifyTransport() {
//   try {
//     await transporter.verify();
//     console.log('[mail] SMTP ready');
//   } catch (e) {
//     console.error('[mail] SMTP verify failed:', e);
//   }
// }

// export async function sendMailSafe(options) {
//   const from = MAIL_FROM || `GreenRent <${EMAIL_USER}>`;
//   const info = await transporter.sendMail({ from, ...options });

//   console.log('[mail] messageId:', info.messageId);
//   console.log('[mail] accepted:', info.accepted);
//   console.log('[mail] rejected:', info.rejected);
//   console.log('[mail] response:', info.response);

//   return info;
// }




// utils/emailService.js
import nodemailer from 'nodemailer';

const {
  EMAIL_USER,
  EMAIL_PASS,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  MAIL_FROM,
} = process.env;

if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_PASS.trim()) {
  throw new Error('[mail] Missing EMAIL_USER and/or EMAIL_PASS (use Gmail app password without spaces)');
}

let transporter;
if (SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: String(SMTP_SECURE || 'false') === 'true',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS.trim() },
  });
} else {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS.trim() },
  });
}

export { transporter };

export async function verifyTransport() {
  try {
    await transporter.verify();
    console.log('[mail] SMTP ready');
  } catch (e) {
    console.error('[mail] SMTP verify failed:', e);
  }
}

export async function sendMailSafe(options) {
  const from = MAIL_FROM || `GreenRent <${EMAIL_USER}>`;
  const info = await transporter.sendMail({ from, ...options });
  console.log('[mail] messageId:', info.messageId);
  console.log('[mail] accepted:', info.accepted);
  console.log('[mail] rejected:', info.rejected);
  console.log('[mail] response:', info.response);
  return info;
}