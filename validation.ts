import { menuById, type MenuItem } from '../shared/menu';
import { booking, istToday } from '../shared/site';
import type { OrderType } from '../shared/types';

type Result<T> = { ok: true; data: T } | { ok: false; error: string };
const fail = (error: string) => ({ ok: false as const, error });

const DAY_MS = 24 * 60 * 60 * 1000;

const text = (value: unknown, max: number): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= max ? trimmed : null;
};

const optionalText = (value: unknown, max: number): string | null => {
  if (typeof value !== 'string') return null;
  return value.trim().slice(0, max) || null;
};

/** Accepts 10-digit Indian mobiles or +country numbers. Returns E.164-style digits. */
export function normalisePhone(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[\s\-()]/g, '');
  if (!/^\+?\d{10,15}$/.test(cleaned)) return null;
  return /^\d{10}$/.test(cleaned) ? `+91${cleaned}` : cleaned;
}

function parseDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return null;
  const latest = new Date(Date.now() + booking.maxDaysAhead * DAY_MS).toISOString().slice(0, 10);
  if (value < istToday() || value > latest) return null;
  return value;
}

export type ReservationInput = {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  notes: string | null;
};

export function parseReservation(b: Record<string, unknown>): Result<ReservationInput> {
  const name = text(b.name, 80);
  const phone = normalisePhone(b.phone);
  const date = parseDate(b.date);
  const slot = b.time;
  const time = typeof slot === 'string' && booking.times.includes(slot) ? slot : null;
  const guests = Number(b.guests);

  if (!name) return fail('Please enter your name.');
  if (!phone) return fail('Please enter a valid phone number.');
  if (!date) return fail(`Please choose a date from today, up to ${booking.maxDaysAhead} days ahead.`);
  if (!time) return fail('Please choose a time slot.');
  if (!Number.isInteger(guests) || guests < 1 || guests > booking.maxGuests) {
    return fail(`Number of guests must be between 1 and ${booking.maxGuests}.`);
  }
  return { ok: true, data: { name, phone, date, time, guests, notes: optionalText(b.notes, 300) } };
}

export type OrderLine = { id: string; name: string; unitPrice: number; qty: number };

export type OrderInput = {
  name: string;
  phone: string;
  orderType: OrderType;
  notes: string | null;
  lines: OrderLine[];
  total: number;
};

export function parseOrder(b: Record<string, unknown>): Result<OrderInput> {
  const name = text(b.name, 80);
  const phone = normalisePhone(b.phone);
  const type = b.orderType;
  const orderType: OrderType | null = type === 'dine_in' || type === 'takeaway' ? type : null;
  const rawItems = b.items;

  if (!name) return fail('Please enter your name.');
  if (!phone) return fail('Please enter a valid phone number.');
  if (!orderType) return fail('Please choose pickup or dine-in.');
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 30) {
    return fail('Your order is empty or too large.');
  }

  // Prices always come from the server's menu, never from the browser.
  const lines: OrderLine[] = [];
  for (const raw of rawItems) {
    const entry = (raw ?? {}) as { id?: unknown; qty?: unknown };
    const item: MenuItem | undefined = typeof entry.id === 'string' ? menuById.get(entry.id) : undefined;
    const qty = Number(entry.qty);
    if (!item) return fail('One of the dishes is no longer on the menu. Please refresh and try again.');
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return fail('Quantities must be between 1 and 20.');
    lines.push({ id: item.id, name: item.name, unitPrice: item.price, qty });
  }

  const total = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
  return { ok: true, data: { name, phone, orderType, notes: optionalText(b.notes, 300), lines, total } };
}
