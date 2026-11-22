import { neon } from '@neondatabase/serverless';

type Sql = ReturnType<typeof neon>;

let client: Sql | undefined;
let schemaReady: Promise<void> | undefined;

/** Neon serverless Postgres client. Reused across warm function invocations. */
export function db(): Sql {
  if (!client) {
    const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
    if (!url) throw new Error('DATABASE_URL is not set. Connect a Neon database to the Vercel project first.');
    client = neon(url);
  }
  return client;
}

/** Creates the tables on first use. Idempotent, so there is no manual SQL step. */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    const sql = db();
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS reservations (
          id UUID PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          booking_date DATE NOT NULL,
          booking_time TEXT NOT NULL,
          guests INTEGER NOT NULL,
          notes TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS orders (
          id UUID PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          order_type TEXT NOT NULL,
          notes TEXT,
          items JSONB NOT NULL,
          total INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'received',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
    })().catch((err: unknown) => {
      schemaReady = undefined; // allow a retry on the next request
      throw err;
    });
  }
  return schemaReady;
}
