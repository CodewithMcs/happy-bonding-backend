# Happy Bonding Admin API

Layered Express / Sequelize / MySQL 8 API for a React admin panel.

## Setup

1. Install Node.js 20+ and MySQL 8.
2. Copy `.env.example` to `.env` and use long, independent JWT secrets.
3. Create the database configured by `DB_NAME`.
4. Run `npm install`, then `npm run db:setup`.
5. Start with `npm run dev` or `npm start`.

The seed creates `admin@happybonding.com` / `Admin@123`. Change this password immediately after first login.

## API

All responses use `{ "success": true, "message": "...", "data": {} }`; errors use `{ "success": false, "message": "..." }`. Protected endpoints require `Authorization: Bearer <accessToken>`.

Auth endpoints are under `/api/auth`. CRUD resources are `/api/users`, `/api/products`, `/api/categories`, `/api/orders`, `/api/customers`, `/api/enquiries`, `/api/messages`, and `/api/settings`. Additional endpoints are `/api/dashboard` and `/api/profile`.

List endpoints support `page`, `limit` (maximum 100), and `search`. Public entity URLs use UUIDs; relationship payloads use internal numeric IDs in this initial schema.

Refresh tokens can be submitted in the JSON body or the secure, HTTP-only `refreshToken` cookie. The API rotates them atomically and revokes the prior token. OTP and password reset values are visible only when `NODE_ENV=development` (or explicitly exposed for local development) through the placeholder notification adapter in `src/services/notification.service.js`; connect a real transactional email/SMS provider before production deployment.

## Production checklist

- Set `NODE_ENV=production`, `COOKIE_SECURE=true`, exact `CORS_ORIGINS`, and correct `TRUST_PROXY`.
- Store secrets in a secret manager and use TLS for HTTP and MySQL.
- Replace the notification adapter and avoid application logs containing credentials.
- Run migrations as a release job; never use Sequelize `sync()` in production.
- Change the seeded password, configure backups/monitoring, and add provider-specific integration tests.
