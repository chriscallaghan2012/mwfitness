/**
 * Shared helper to send enquiries to the MWFitnessUK email backend.
 * Works on Vercel (api/send-mail) and locally (vite proxies /api to :8787).
 */

export interface EnquiryPayload {
  kind: 'enquiry' | 'book-call' | 'waitlist' | 'shwag';
  name: string;
  email: string;
  phone?: string;
  interest?: string;
  goal?: string;
  times?: string[];
  message?: string;
  page?: string;
}

export async function postEnquiry(
  payload: EnquiryPayload
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/send-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || 'Something went wrong. Please try again.');
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return { ok: false, error: message };
  }
}