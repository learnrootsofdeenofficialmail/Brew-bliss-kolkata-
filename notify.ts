/**
 * Optional email alert via Resend (https://resend.com).
 * Does nothing unless RESEND_API_KEY and NOTIFY_EMAIL are set.
 * Failures are logged and never block the guest's request.
 */
export async function notifyRestaurant(subject: string, body: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM ?? 'Brew & Bliss <onboarding@resend.dev>',
        to: [to],
        subject,
        text: body,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error('Resend returned', res.status, await res.text());
  } catch (err) {
    console.error('Notification failed', err);
  }
}
