export type CaptchaProvider = 'hcaptcha' | 'recaptcha';

export async function verifyCaptcha(
  token: string,
  remoteIp?: string,
  provider: CaptchaProvider = (process.env.CAPTCHA_PROVIDER as CaptchaProvider) || 'hcaptcha'
) {
  if (!token) return false;

  try {
    if (provider === 'recaptcha') {
      const secret = process.env.CAPTCHA_SECRET || '';
      const params = new URLSearchParams({ secret, response: token });
      if (remoteIp) params.append('remoteip', remoteIp);
      const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const data = await res.json();
      return Boolean(data.success);
    }

    // hCaptcha
    const secret = process.env.CAPTCHA_SECRET || '';
    const params = new URLSearchParams({ secret, response: token });
    if (remoteIp) params.append('remoteip', remoteIp);
    const res = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (e) {
    console.error('Captcha verification error:', e);
    return false;
  }
}

