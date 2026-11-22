import { db, ensureSchema } from '../../server/db';
import { allowMethods, isAdmin, readBody, send, type ApiRequest, type ApiResponse } from '../../server/http';

const STATUSES = {
  reservations: ['pending', 'confirmed', 'cancelled'],
  orders: ['received', 'preparing', 'ready', 'completed', 'cancelled'],
} as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Staff endpoint, protected by the ADMIN_TOKEN environment variable.
 *   GET   /api/admin/reservations   (or /api/admin/orders)
 *   PATCH /api/admin/reservations   body: { "id": "<uuid>", "status": "confirmed" }
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ['GET', 'PATCH'])) return;
  if (!isAdmin(req)) return send(res, 401, { ok: false, error: 'Unauthorised' });

  const kind = req.query.kind === 'reservations' ? 'reservations' : req.query.kind === 'orders' ? 'orders' : null;
  if (!kind) return send(res, 404, { ok: false, error: 'Unknown resource' });

  try {
    await ensureSchema();
    const sql = db();

    if (req.method === 'GET') {
      const rows =
        kind === 'reservations'
          ? await sql`
              SELECT id, name, phone, booking_date::text AS booking_date, booking_time, guests, notes, status, created_at
              FROM reservations ORDER BY created_at DESC LIMIT 200`
          : await sql`
              SELECT id, name, phone, order_type, notes, items, total, status, created_at
              FROM orders ORDER BY created_at DESC LIMIT 200`;
      return send(res, 200, { ok: true, rows });
    }

    // PATCH: update status
    const body = readBody(req);
    const id = typeof body.id === 'string' ? body.id : '';
    const status = typeof body.status === 'string' ? body.status : '';
    if (!UUID.test(id) || !(STATUSES[kind] as readonly string[]).includes(status)) {
      return send(res, 400, { ok: false, error: 'Provide a valid id and an allowed status.' });
    }

    if (kind === 'reservations') {
      await sql`UPDATE reservations SET status = ${status} WHERE id = ${id}`;
    } else {
      await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
    }
    return send(res, 200, { ok: true });
  } catch (err) {
    console.error('Admin request failed', err);
    return send(res, 500, { ok: false, error: 'Server error' });
  }
}
