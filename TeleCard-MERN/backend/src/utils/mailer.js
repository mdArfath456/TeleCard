const nodemailer = require('nodemailer');

const brevoKey = process.env.BREVO_API_KEY;
const brevoFromEmail = process.env.BREVO_FROM_EMAIL;
const brevoFromName = process.env.BREVO_FROM_NAME || 'TeleCard';

const smtpUser = process.env.MAIL_USERNAME;
const smtpPass = process.env.MAIL_PASSWORD;

const brevoConfigured = Boolean(brevoKey && brevoFromEmail);
const smtpConfigured = Boolean(smtpUser && smtpPass);

let smtpTransport = null;
function getSmtpTransport() {
  if (!smtpTransport) {
    smtpTransport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });
  }
  return smtpTransport;
}

async function sendViaBrevo({ to, toName, subject, html }) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'api-key': brevoKey,
    },
    body: JSON.stringify({
      sender: { email: brevoFromEmail, name: brevoFromName },
      to: [{ email: to, name: toName || to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Brevo API responded ${res.status}: ${body}`);
  }
}

async function sendViaSmtp({ to, subject, html }) {
  await getSmtpTransport().sendMail({
    from: `"${brevoFromName}" <${smtpUser}>`,
    to,
    subject,
    html,
  });
}

// Tries Brevo's transactional API first (fast, no SMTP handshake), falls
// back to Gmail SMTP if that's configured instead, and finally just logs
// to the console in local/dev environments with no mail provider set up.
// Never throws — a failed/missing email should never break the request
// that triggered it (e.g. order fulfillment).
async function sendMail({ to, toName, subject, html }) {
  if (brevoConfigured) {
    try {
      await sendViaBrevo({ to, toName, subject, html });
      return { sent: true, provider: 'brevo' };
    } catch (err) {
      console.error('[mailer] Brevo send failed, trying SMTP fallback:', err.message);
    }
  }

  if (smtpConfigured) {
    try {
      await sendViaSmtp({ to, subject, html });
      return { sent: true, provider: 'smtp' };
    } catch (err) {
      console.error('[mailer] SMTP send failed:', err.message);
    }
  }

  if (!brevoConfigured && !smtpConfigured) {
    console.log(`[mailer] No provider configured — would have sent to ${to}: "${subject}"`);
  }
  return { sent: false, provider: null };
}

module.exports = { sendMail, brevoConfigured, smtpConfigured };
