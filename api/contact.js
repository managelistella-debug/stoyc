const { Resend } = require('resend');

const DEFAULT_NOTIFY = ['derek@stoyc.com', 'rafi@stoyc.com'];

function escapeHtml(str) {
  if (str == null || str === '') return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let raw = {};
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    raw = req.body;
  } else if (Buffer.isBuffer(req.body)) {
    try {
      raw = JSON.parse(req.body.toString('utf8') || '{}');
    } catch {
      raw = {};
    }
  } else if (typeof req.body === 'string') {
    try {
      raw = JSON.parse(req.body || '{}');
    } catch {
      raw = {};
    }
  }

  const { name, email, service, message, website } = raw;

  if (website) {
    return res.status(200).json({ ok: true });
  }

  const nameTrim = typeof name === 'string' ? name.trim() : '';
  const serviceTrim = typeof service === 'string' ? service.trim() : '';
  const messageTrim = typeof message === 'string' ? message.trim() : '';
  const emailTrim = typeof email === 'string' ? email.trim() : '';

  if (!nameTrim || nameTrim.length > 200) {
    return res.status(400).json({ ok: false, error: 'Please enter your name.' });
  }
  if (!isValidEmail(emailTrim)) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
  }
  if (!serviceTrim || serviceTrim.length > 200) {
    return res.status(400).json({ ok: false, error: 'Please select what you need.' });
  }
  if (messageTrim.length > 10000) {
    return res.status(400).json({ ok: false, error: 'Message is too long.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ ok: false, error: 'Email is not configured.' });
  }

  const from = process.env.RESEND_FROM || 'Stoyc <contact@stoyc.com>';

  const notifyList = process.env.CONTACT_NOTIFY_TO
    ? process.env.CONTACT_NOTIFY_TO.split(',').map((s) => s.trim()).filter(Boolean)
    : DEFAULT_NOTIFY;

  if (notifyList.length === 0) {
    return res.status(500).json({ ok: false, error: 'No notification recipients configured.' });
  }

  const resend = new Resend(apiKey);

  const subject = `New contact: ${nameTrim}`;
  const html = `
    <p><strong>Name</strong><br>${escapeHtml(nameTrim)}</p>
    <p><strong>Email</strong><br>${escapeHtml(emailTrim)}</p>
    <p><strong>Service</strong><br>${escapeHtml(serviceTrim)}</p>
    <p><strong>Message</strong><br>${escapeHtml(messageTrim) || '<em>(none)</em>'}</p>
  `;
  const text = [
    `Name: ${nameTrim}`,
    `Email: ${emailTrim}`,
    `Service: ${serviceTrim}`,
    `Message: ${messageTrim || '(none)'}`,
  ].join('\n');

  const { error } = await resend.emails.send({
    from,
    to: notifyList,
    replyTo: emailTrim,
    subject,
    html,
    text,
  });

  if (error) {
    return res.status(502).json({ ok: false, error: 'Could not send message. Please try again.' });
  }

  return res.status(200).json({ ok: true });
};
