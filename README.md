# Prime Fusion

QR-enabled ordering platform for the **Prime Fusion** Jamaican fusion food truck.

> **Note:** Data is stored in a local JSON file (`data/store.json`) for now. Prisma / a real database will be added when we go live.

## Features

- Public interactive ordering (dine-in / to-go) via QR stations
- Build-Your-Bowl flow (1 protein $15 / 2 proteins $25) plus full signature menu
- Stripe Checkout (demo auto-pay when keys are placeholders)
- Kitchen prep board with SMS status updates (Twilio or console log in dev)
- Customer receipts + live order status
- Rewards / loyalty points
- Admin: analytics, tax reports & rates, inventory, price/cost management, cost optimization tips, QR codes

## Quick start

```bash
npm install
npm run db:setup
npm run dev
```

Open http://localhost:3000

### Demo logins

| Role    | Email                     | Password           |
|---------|---------------------------|--------------------|
| Admin   | admin@primefusion.com     | fusion-admin-2024  |
| Kitchen | kitchen@primefusion.com   | kitchen-2024       |

### QR order URLs

- `/order/qr/truck-window`
- `/order/qr/picnic-a`
- `/order/qr/picnic-b`

## Environment

Copy `.env.example` to `.env`. Set real `STRIPE_*` and `TWILIO_*` values for production payments and SMS.

## Data

- `npm run db:setup` — reset/seed `data/store.json`
- `npm run db:seed` — seed only if empty
- Auto-seeds on first API request if the store is empty
