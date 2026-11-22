import { randomUUID } from 'node:crypto';
import { db, ensureSchema } from '../server/db';
import { allowMethods, isHoneypotFilled, readBody, refCode, send, type ApiRequest, type ApiResponse } from '../server/http';
import { notifyRestaurant } from '../server/notify';
import { parseReservation } from '../server/validation';
import { booking, site } from '../shared/site';

// POST /api/reservations
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ['POST'])) return;

  const body = readBody(req);
  if (isHoneypotFilled(body)) return send(res, 201, { ok: true, reference: 'BB-000000' });

  const parsed = parseReservation(body);
  if (!parsed.ok) return send(res, 400, parsed);
  const r = parsed.data;

  try {
    await ensureSchema();
    const sql = db();

    const recent = await sql`
      SELECT COUNT(*)::int AS count FROM reservations
      WHERE phone = ${r.phone} AND created_at > now() - interval '1 hour'`;
    if (Number(recent[0]?.count) >= booking.maxRequestsPerHour) {
      return send(res, 429, {
        ok: false,
        error: `Too many requests from this number. Please call us on ${site.phoneDisplay}.`,
      });
    }

    const id = randomUUID();
    await sql`
      INSERT INTO reservations (id, name, phone, booking_date, booking_time, guests, notes)
      VALUES (${id}, ${r.name}, ${r.phone}, ${r.date}, ${r.time}, ${r.guests}, ${r.notes})`;

    await notifyRestaurant(
      `New table request: ${r.name}, ${r.guests} guest(s) on ${r.date} at ${r.time}`,
      [
        `Reference: ${refCode(id)}`,
        `Name: ${r.name}`,
        `Phone: ${r.phone}`,
        `Date: ${r.date}`,
        `Time: ${r.time}`,
        `Guests: ${r.guests}`,
        `Notes: ${r.notes ?? '-'}`,
      ].join('\n'),
    );

    return send(res, 201, { ok: true, reference: refCode(id) });
  } catch (err) {
    console.error('Reservation failed', err);
    return send(res, 500, {
      ok: false,
      error: `Something went wrong. Please try again or call us on ${site.phoneDisplay}.`,
    });
  }
}
