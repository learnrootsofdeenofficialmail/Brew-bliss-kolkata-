import { timingSafeEqual } from 'node:crypto';

// Minimal shapes of Vercel's Node.js request and response objects.
// Defined here so the server code type-checks without extra packages.
export type ApiRequest = {
  method?: string;
  body?: unknown;
  query: Record<string, string | string[] | undefined>;
  headers: Record<string, string | string[] | undefined>;
};

export type ApiResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): { json(body: unknown): void };
};

export function send(res: ApiResponse, status: number, body: unknown): void {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}

export function allowMethods(req: ApiRequest, res: ApiResponse, methods: string[]): boolean {
  if (req.method && methods.includes(req.method)) return true;
  res.setHeader('Allow', methods.join(', '));
  send(res, 405, { ok: false, error: 'Method not allowed' });
  return false;
}

/** Vercel parses JSON bodies automatically; this also copes with a raw string body. */
export function readBody(req: ApiRequest): Record<string, unknown> {
  let body: unknown = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
}

/** Hidden "website" field: people leave it empty, bots tend to fill every field. */
export function isHoneypotFilled(body: Record<string, unknown>): boolean {
  return typeof body.website === 'string' && body.website.trim() !== '';
}

/** Short, human-friendly reference shown to the guest, e.g. BB-3F9A1C. */
export function refCode(id: string): string {
  return `BB-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

/** Constant-time check of "Authorization: Bearer <ADMIN_TOKEN>". */
export function isAdmin(req: ApiRequest): boolean {
  const expected = process.env.ADMIN_TOKEN;
  const header = req.headers.authorization;
  if (!expected || typeof header !== 'string' || !header.startsWith('Bearer ')) return false;
  const given = Buffer.from(header.slice('Bearer '.length));
  const want = Buffer.from(expected);
  return given.length === want.length && timingSafeEqual(given, want);
}
