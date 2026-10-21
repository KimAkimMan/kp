This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Backend API

The backend uses a modular route-service-repository architecture. Protected
routes use the signed JWT `kp_session` HTTP-only cookie created by
`POST /api/auth/login`. Login also returns the same JWT as `data.accessToken`
for API clients that need to store it outside the browser cookie.

Required environment variables:

- `DATABASE_URL`
- `JWT_SECRET` (minimum 32 characters; use a high-entropy production secret)
- `APP_ORIGIN` (recommended for CSRF origin validation, for example
  `https://example.com`)

The readiness endpoint requires all required environment variables and a
reachable database:

- `GET /api/health` checks that the application is running.
- `GET /api/ready` checks configuration and database connectivity.

List endpoints use global pagination:

```text
?page=1&pageSize=25
```

The maximum page size is 100. Mutating API requests with an `Origin` header
must match `APP_ORIGIN`.

Core endpoints:

- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET/POST /api/users`, `GET/PATCH/DELETE /api/users/:id`
- `GET/POST /api/programs`, `GET/PATCH/DELETE /api/programs/:id`
- `POST /api/programs/:id/claim`, `/progress`, `/costs`, and `/complete`
- `GET/POST /api/surveys`, `GET/PATCH/DELETE /api/surveys/:id`
- `POST /api/surveys/:id/verify` and `/convert`
- `GET/POST /api/advice`, `GET/PATCH/DELETE /api/advice/:id`
- `GET /api/reports/summary`
- `GET /api/health`, `GET /api/ready`

Apply database changes with `npx prisma migrate deploy`, followed by
`npx prisma generate`.

For a development database, run the idempotent seed after applying migrations:

```bash
npm run db:seed
```

The seed creates `admin@kp.local`, `operator@kp.local`, and
`pimpinan@kp.local`. All three use the development password
`Password123!`. Do not use these credentials outside local development.

API documentation is available at:

- OpenAPI JSON: `/api/openapi`
- Swagger UI: `/api/docs`

Run backend unit tests with `npm test` or use `npm run test:watch` during
development.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
