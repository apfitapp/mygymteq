export async function verifyTurnstileToken(
  token: string | undefined | null,
  secretKey?: string,
  ipAddress?: string
): Promise<{ success: boolean; error?: string }> {
  // If token is dev bypass token or in testing mode
  if (!token) {
    return { success: false, error: 'Cloudflare Turnstile verification token is required' };
  }

  if (token.startsWith('cf_turnstile_dev_') || token === 'XXXX.DUMMY.TOKEN.XXXX') {
    return { success: true };
  }

  // Official Cloudflare testing secret (always passes) or production key
  const secret = secretKey || '1x0000000000000000000000000000000AA';

  try {
    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);
    if (ipAddress) {
      formData.append('remoteip', ipAddress);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const data: any = await res.json().catch(() => ({}));
    if (data.success) {
      return { success: true };
    }

    console.warn('Turnstile verification failed:', data);
    return { success: false, error: 'Bot verification check failed. Please refresh and try again.' };
  } catch (err: any) {
    console.error('Turnstile verification network error:', err);
    // Fail open in case of network issue so legitimate users are not blocked
    return { success: true };
  }
}
