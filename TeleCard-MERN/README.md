# TeleCard — MERN rewrite

A full MongoDB/Express/React rewrite of the original Spring Boot TeleCard backend, with a
brand-new glassmorphism/animated UI and Razorpay checkout (manual UPI/UTR verification as fallback).

## Structure

```
TeleCard-MERN/
  backend/     Express + Mongoose API (mirrors the original Spring Boot feature set)
  frontend/    React 18 + Vite + Tailwind + Framer Motion
```

## Backend setup

```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, and (optionally) Razorpay keys
npm install
npm run dev                # or: npm start
```

On first boot it seeds an admin account (`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`,
defaults to `admin@telecard.com` / `Admin@12345`) and three starter categories.

Uploaded payment screenshots are stored on disk under `backend/uploads/payments` and served
at `/uploads/payments/<file>` — swap in Cloudinary/S3 for production.

### Razorpay (optional)

Leave `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` blank to run manual-only. Add test keys from
the [Razorpay dashboard](https://dashboard.razorpay.com/app/keys) to enable the "Pay with
Razorpay" option — payments are auto-verified server-side via HMAC signature check, and stock
is decremented the same way a manually-verified payment is. If Razorpay checkout fails to load,
gets cancelled, or the server call errors out, the UI automatically falls back to the manual
UPI/UTR + screenshot flow, and admins can still verify from `/admin/payments`.

### Cloudinary (optional)

Leave `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` blank to store
payment screenshots on local disk (`backend/uploads/payments/`). Set all three and uploads are
streamed straight to Cloudinary instead — no code changes needed, `middleware/upload.js`
auto-detects which one is configured.

### Email (optional)

Two providers, tried in order with automatic fallback — same pattern as Razorpay/manual:

1. **Brevo transactional API** — set `BREVO_API_KEY` + `BREVO_FROM_EMAIL`
2. **Gmail SMTP via Nodemailer** — set `MAIL_USERNAME` + `MAIL_PASSWORD` (use a
   [Google App Password](https://myaccount.google.com/apppasswords), not your normal password)

Leave everything blank and emails just log to the console — useful for local dev. Emails are
sent for account registration (welcome) and order fulfillment (card details delivery); wire up
more triggers in `utils/mailer.js` / the relevant controller as needed.

### Mapping from the Spring Boot `application.properties`

| Spring property | MERN backend `.env` var | Notes |
|---|---|---|
| `server.port` | `PORT` | same |
| `spring.datasource.url/username/password` | `MONGO_URI` | one connection string instead of three (Mongo has no separate user/pass fields when embedded in the URI) |
| `app.frontend-url` | `FRONTEND_URL` | same |
| `jwt.secret` / `jwt.expiration` / `jwt.refresh-expiration` | `JWT_SECRET` / `JWT_EXPIRATION` / `JWT_REFRESH_EXPIRATION` | same |
| `jwt.cookie.name` / `jwt.refresh-cookie.name` | `JWT_COOKIE_NAME` / `JWT_REFRESH_COOKIE_NAME` | same |
| `jwt.cookie.secure` / `jwt.cookie.same-site` | `JWT_COOKIE_SECURE` / `JWT_COOKIE_SAME_SITE` | use `true` + `None` only when frontend/backend are on different HTTPS domains |
| `cloudinary.*` | `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | same values, same purpose |
| `brevo.*` | `BREVO_API_KEY` / `BREVO_FROM_EMAIL` / `BREVO_FROM_NAME` | same |
| `spring.mail.username/password` | `MAIL_USERNAME` / `MAIL_PASSWORD` | Gmail SMTP fallback if Brevo isn't set |
| `spring.datasource.hikari.*` | — | no equivalent needed — Mongoose manages its own connection pool automatically |
| `spring.jpa.*` | — | no equivalent — Mongoose has no schema migrations/DDL step |
| `spring.servlet.multipart.max-file-size` | already enforced in `middleware/upload.js` (`limits.fileSize`, currently 10MB) | |

## Frontend setup

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:8080
npm install
npm run dev                # http://localhost:5173
```

## Feature parity

- Auth: register/login/logout, JWT access + refresh cookies, profile edit, password change, account deactivation
- Catalog: categories + cards (credit/debit/business), search & filter, admin CRUD
- Cart: add/increase/decrease/remove/clear
- Orders: create from selected cart items, my-orders, admin all-orders + status updates + fulfillment (card detail delivery per item)
- Payments: Razorpay checkout (auto-verify) **or** manual UPI/UTR + screenshot (admin verify/reject)
- Admin: dashboard overview, cards, categories, orders, payments, users (block/activate/role change)

## Notes

- Passwords are bcrypt-hashed (the original demo backend stored screenshots via Cloudinary; here Multer + local disk keeps the demo self-contained).
- Card fulfillment/order-ready emails are stubbed with a `console.log` — wire up Nodemailer or a transactional email provider in `orderController.js`.
