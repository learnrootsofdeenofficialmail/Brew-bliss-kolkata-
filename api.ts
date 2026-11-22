import type { ApiError } from '../../shared/types';

/** POSTs JSON to the API and returns the parsed body, or throws with the server's message. */
export async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && typeof (data as ApiError).error === 'string'
        ? (data as ApiError).error
        : 'Something went wrong. Please try again.';
    throw new Error(message);
  }
  return data as T;
}
