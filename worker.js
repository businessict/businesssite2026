// Cloudflare Worker for the Business ICT Australia site.
// Every page is pre-built HTML in ./dist (see build.js) and served by
// Cloudflare directly. This Worker only runs for /contact, to handle the
// form submission - the same job the POST /contact route does in server.js.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/contact') {
      if (request.method === 'POST') {
        return handleContact(request, env, url);
      }
      // /contact?error=true -> the version of the page with the error banner
      if (url.searchParams.has('error')) {
        return env.ASSETS.fetch(new Request(new URL('/contact-error', url), request));
      }
    }

    return env.ASSETS.fetch(request);
  }
};

// Escape anything a visitor typed before putting it in the email HTML
function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// Remove line breaks so a visitor can't tamper with the email subject
function oneLine(value) {
  return String(value == null ? '' : value).replace(/[\r\n]+/g, ' ').trim();
}

function redirect(url, to) {
  return Response.redirect(new URL(to, url).toString(), 303);
}

// Ask Cloudflare whether the captcha was genuinely passed
async function verifyTurnstile(token, request, env) {
  if (!env.TURNSTILE_SECRET_KEY) {
    console.error('TURNSTILE_SECRET_KEY is not set - rejecting form submission.');
    return false;
  }
  try {
    const body = new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token || ''
    });
    const ip = request.headers.get('CF-Connecting-IP');
    if (ip) body.set('remoteip', ip);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body
    });
    const result = await response.json();
    return result.success === true;
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return false;
  }
}

async function handleContact(request, env, url) {
  let form;
  try {
    form = await request.formData();
  } catch (err) {
    return redirect(url, '/contact?error=true');
  }
  const field = (name) => {
    const value = form.get(name);
    return typeof value === 'string' ? value : '';
  };

  const name = field('name');
  const company = field('company');
  const email = field('email');
  const phone = field('phone');
  const interest = field('interest');
  const message = field('message');

  // Honeypot: real visitors never see this field, bots fill it in.
  // Pretend it worked so the bot moves on, but send nothing.
  if (field('website')) {
    return redirect(url, '/thank-you');
  }

  // Every field except the message is mandatory
  const allFilled = [name, company, email, phone, interest].every((v) => v.trim() !== '');
  if (!allFilled) {
    return redirect(url, '/contact?error=true');
  }

  // Captcha must have been passed
  const captchaOk = await verifyTurnstile(field('cf-turnstile-response'), request, env);
  if (!captchaOk) {
    return redirect(url, '/contact?error=true');
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: env.CONTACT_TO,
        // "Reply" goes to the visitor. Left out if the address looks invalid,
        // since Resend rejects the whole email over a bad reply_to.
        reply_to: /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/.test(email.trim()) ? email.trim() : undefined,
        subject: `New enquiry from ${oneLine(name)} — ${oneLine(interest)}`,
        html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${esc(name)}</p>
        <p><strong>Business:</strong> ${esc(company)}</p>
        <p><strong>Email:</strong> ${esc(email)}</p>
        <p><strong>Phone:</strong> ${esc(phone)}</p>
        <p><strong>Interested in:</strong> ${esc(interest)}</p>
        <p><strong>Message:</strong><br>${esc(message || '(none)').replace(/\r?\n/g, '<br>')}</p>
      `
      })
    });
    if (!response.ok) {
      throw new Error('Resend returned ' + response.status + ': ' + (await response.text()));
    }
    return redirect(url, '/thank-you');
  } catch (error) {
    console.error('Resend error:', error);
    return redirect(url, '/contact?error=true');
  }
}
