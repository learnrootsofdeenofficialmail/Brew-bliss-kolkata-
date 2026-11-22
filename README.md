# Brew & Bliss — Salt Lake, Kolkata (full website)

React + TypeScript + Vite frontend, Vercel Serverless Functions for the backend (`/api`), Neon Postgres for storage, and optional email alerts through Resend.

## What the site does

- Menu with category filters and a working cart (prices are checked on the server).
- Order placement (takeaway or dine-in), saved to the database.
- Table requests with date, time and guest count, saved to the database.
- Staff API to list and update requests and orders, protected by a token.
- Optional email alert for every new request or order.

## Project layout

```
api/                  Vercel functions → /api/reservations, /api/orders, /api/admin/:kind
server/               Shared server code: database, HTTP helpers, validation, email
shared/               Used by both frontend and backend: menu, site details, booking rules, types
src/                  React frontend (App.tsx, components/, lib/api.ts)
vercel.json           Build settings and security headers
.env.example          Environment variables (copy to .env.local for local work)
```

## 1. Run locally (optional)

```bash
npm install
npx vercel login
npx vercel link            # link this folder to a Vercel project
npx vercel env pull        # download DATABASE_URL and other variables to .env.local
npm run dev:api            # full site + API at http://localhost:3000
```

`npm run dev` starts the frontend only, so API calls will fail there. Use `dev:api` for end-to-end testing.

## 2. Put the code on GitHub

```bash
git init
git add .
git commit -m "Brew & Bliss full website"
git branch -M main
git remote add origin https://github.com/<your-user>/brew-bliss-kolkata.git
git push -u origin main
```

## 3. Deploy on Vercel

1. Go to vercel.com → **Add New… → Project** and import the GitHub repository. The Vite preset is detected automatically (build `npm run build`, output `dist`). Click **Deploy**.
2. In the project, open **Storage** → **Create** (or **Connect Database**) → **Neon (Serverless Postgres)** and connect it to this project. This adds `DATABASE_URL` automatically.
3. Open **Settings → Environment Variables** and add:
   - `ADMIN_TOKEN`: a long random string. Create one with `openssl rand -hex 32`.
   - Optional, for email alerts: `RESEND_API_KEY`, `NOTIFY_EMAIL` (where alerts go), and `NOTIFY_FROM` (for example `Brew & Bliss <onboarding@resend.dev>`).
4. Open **Deployments**, choose the latest one and click **Redeploy**. New variables apply only to new deployments.
5. Test: open the live URL, place a test order and a test table request. Tables are created automatically on the first request, so no SQL step is needed.

Optional: under **Settings → Domains**, add your own domain.

## 4. Before going live

- `shared/site.ts`: set the real phone number, address, opening hours, WhatsApp number (optional), Instagram link (optional) and Maps link.
- `shared/menu.ts`: replace the sample dishes and prices. Keep each `id` unchanged once you are live, because saved orders refer to it.
- `shared/menu.ts` and `src/App.tsx`: replace the Unsplash photos with your own, and replace or remove the sample reviews and stats. Don't publish sample reviews as real feedback.
- `index.html`: update the page title and description if needed.
- Check that the email alert arrives (Resend's `onboarding@resend.dev` only sends to the email address on your Resend account until you verify your own domain).

## 5. Managing requests as staff

**Easiest:** open the Neon dashboard (or the Vercel Storage tab), then use the table viewer to read the `reservations` and `orders` tables and change their `status`.

**Via the API:** replace `YOUR_TOKEN` and the site URL below.

```bash
# List table requests
curl -H "Authorization: Bearer YOUR_TOKEN" https://your-site.vercel.app/api/admin/reservations

# List orders
curl -H "Authorization: Bearer YOUR_TOKEN" https://your-site.vercel.app/api/admin/orders

# Confirm a table request (status: pending | confirmed | cancelled)
curl -X PATCH -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" \
  -d '{"id":"<reservation-id>","status":"confirmed"}' https://your-site.vercel.app/api/admin/reservations

# Move an order along (status: received | preparing | ready | completed | cancelled)
curl -X PATCH -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" \
  -d '{"id":"<order-id>","status":"preparing"}' https://your-site.vercel.app/api/admin/orders
```

## 6. Limits to know about

- Requests are **not payments**. Orders are unpaid until you collect payment. To take online payments later, add Razorpay or a similar gateway.
- Table availability isn't checked automatically. Staff confirm each request.
- Spam protection: a hidden honeypot field, input validation, and a limit of 5 requests per phone number per hour. For stronger protection, enable Vercel Firewall rate limiting.
- Phone-number checks accept Indian 10-digit mobiles and international numbers with a `+` prefix.
- Type-check the backend with `npm run typecheck:api`. The frontend is checked by `npm run build`.
