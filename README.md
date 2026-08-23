# Rosal Safety OMS — Web Portal

Admin, Dispatcher, and Accounts web portal for Rosal Safety Private Limited's Order Management System. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS.

## Setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local with your backend's real URL if it's not localhost:4000
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`.

`npm run build` has already been verified to compile cleanly with zero type errors against this exact code.

## Test credentials (from your seed data)

| Role | Employee Code | Password |
|---|---|---|
| Admin | `ADMIN-0001` | `ChangeMe123!` |
| Dispatcher | `DISPATCH-0001` | `ChangeMe123!` |
| Accounts | `ACCOUNTS-0001` | `ChangeMe123!` |

In dev, the OTP appears in your **backend's terminal log** (SMS delivery is still stubbed there), not in this app.

## What's in here

- All 20 pages from the build plan: Login, OTP, Admin (Home, User/Client/Product/Transport/Factory Unit Creation, Management, History, Company Settings, Account), Dispatcher (Order Queue, Order Detail, History, Account), Accounts (Bills Inbox, Create Invoice, History, Account), shared Change Password.
- Fully responsive at three breakpoints (mobile/tablet/desktop) — sidebar collapses to a drawer, tables become stacked cards, the Dispatcher Kanban becomes a tab switcher, modals become bottom sheets, on mobile.
- Real-time updates via Socket.io on all six confirmed events (`order:created/accepted/completed/rejected/cancelled`, `bill:created`).
- Locked Rosal theme (black `#141414` / red `#D42027` / amber `#F5B60E`) applied consistently through Tailwind tokens — see `tailwind.config.ts`.

## Known fallback behaviors (won't block testing, but worth knowing)

These are the handful of things that aren't fully confirmed/live on the backend yet. Each degrades gracefully rather than breaking the page:

| Area | What happens |
|---|---|
| **Invoice PDF** (`GET /invoices/:id/pdf`) | Confirmed backend stub, returns 400 today. Clicking "PDF" in Accounts History shows a toast — "PDF generation isn't available yet" — instead of a broken link. Will start working the moment the backend ships the template, no code change needed here. |
| **Admin profile self-edit** (`PATCH /account/me`) | Not a confirmed route in the delivered contract. The Edit button on Admin's Account page attempts it and shows a graceful toast if it 404s. |
| **Captcha** on User Creation | No backend contract exists for this yet. The field is visible but disabled/non-blocking — submitting the form works without it. |
| **`buyerState` / `consigneeState`** on Create Invoice | No structured state field exists on `Client` yet, so these are plain manual text inputs, optional, never blocking submission. |
| **Full nested response shapes** | `GET /orders/:id`, `GET /bills/:id`, and `GET /clients` are wired to the *real* confirmed payloads. `GET /users`, `/products`, `/transport`, `/factory-units`, dashboard summaries, and search are typed from the original spec docs (not a confirmed live payload) — each API wrapper in `lib/api/` that falls into this bucket is commented `// VERIFY`. If a field renders blank instead of showing data, that's the first place to check against your actual backend response. |
| **Seller name on Dispatcher Kanban cards** | The v1.1 patch asked for this; the confirmed `GET /orders/:id` payload doesn't include a nested `seller` object today. The card checks for it and simply omits the line if absent — ask the backend to add it to the include when convenient, no frontend change needed after that. |
| **Session storage** | The JWT is kept in a cookie (not `localStorage`) so `middleware.ts` can guard routes on navigation. The more secure pattern — an httpOnly cookie behind a full BFF proxy so the token never touches client JS — is a larger piece of infrastructure than this build includes; noted in `lib/session.ts` if you want to upgrade to it later. |

## Project structure

```
app/            Routes (App Router) — grouped by role: admin/, dispatcher/, accounts/
components/
  ui/           Design primitives (Button, Input, Dialog, Select, etc.)
  shared/       App-level shared components (AppShell, DataTable, StatusChip, etc.)
providers/      React Query, Session, Socket providers
lib/
  api/          One typed wrapper file per backend resource
  types.ts      Types matching the real confirmed API payloads
  enums.ts      Single source of truth for every status/role string
  utils.ts      Currency/date formatting, safe Decimal-string math
  nav.ts        Per-role sidebar nav config
middleware.ts   Role-based route guarding
```

## If something looks off once wired to your live backend

Most likely causes, in order of probability:
1. A response field name differs slightly from what's in `lib/types.ts` (search that file for `// VERIFY` comments — those are the unconfirmed shapes).
2. `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_SOCKET_URL` in `.env.local` don't match where your backend is actually running.
3. CORS on the backend doesn't yet include your web dev server's origin.

Everything else was built and verified against the real, confirmed contract from this conversation.
