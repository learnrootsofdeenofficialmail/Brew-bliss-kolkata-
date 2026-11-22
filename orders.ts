import { randomUUID } from 'node:crypto';
import { db, ensureSchema } from '../server/db';
import { allowMethods, isHoneypotFilled, readBody, refCode, send, type ApiRequest, type ApiResponse } from '../server/http';
import { notifyRestaurant } from '../server/notify';
import { parseOrder } from '../server/validation';
import { booking, site } from '../shared/site';

// POST /api/orders
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ['POST'])) return;

  const body = readBody(req);
  if (isHoneypotFilled(body)) return send(res, 201, { ok: true, reference: 'BB-000000', total: 0 });

  const parsed = parseOrder(body);
  if (!parsed.ok) return send(res, 400, parsed);
  const o = parsed.data;

  try {
    await ensureSchema();
    const sql = db();

    const recent = await sql`
      SELECT COUNT(*)::int AS count FROM orders
      WHERE phone = ${o.phone} AND created_at > now() - interval '1 hour'`;
    if (Number(recent[0]?.count) >= booking.maxRequestsPerHour) {
      return send(res, 429, {
        ok: false,
        error: `Too many orders from this number. Please call us on ${site.phoneDisplay}.`,
      });
    }

    const id = randomUUID();
    await sql`
      INSERT INTO orders (id, name, phone, order_type, notes, items, total)
      VALUES (${id}, ${o.name}, ${o.phone}, ${o.orderType}, ${o.notes}, ${JSON.stringify(o.lines)}::jsonb, ${o.total})`;

    const itemList = o.lines.map((line) => `${line.qty} x ${line.name} (₹${line.unitPrice * line.qty})`);
    await notifyRestaurant(
      `New order from ${o.name}: ₹${o.total}`,
      [
        `Reference: ${refCode(id)}`,
        `Name: ${o.name}`,
        `Phone: ${o.phone}`,
        `Type: ${o.orderType === 'dine_in' ? 'Dine-in' : 'Takeaway'}`,
        `Notes: ${o.notes ?? '-'}`,
        '',
        ...itemList,
        '',
        `Total: ₹${o.total}`,
      ].join('\n'),
    );

    return send(res, 201, { ok: true, reference: refCode(id), total: o.total });
  } catch (err) {
    console.error('Order failed', err);
    return send(res, 500, {
      ok: false,
      error: `Something went wrong. Please try again or call us on ${site.phoneDisplay}.`,
    });
  }
}
