// Request/response contract shared by the frontend and the API.
export type OrderType = 'dine_in' | 'takeaway';

export type ReservationResponse = { ok: true; reference: string };
export type OrderResponse = { ok: true; reference: string; total: number };
export type ApiError = { ok: false; error: string };
