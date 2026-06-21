# SQLGenius Backend API

Production-ready Express + TypeScript backend for the AI-Powered Natural Language to SQL Query Generator.

## Query History Endpoints

Primary endpoint:

```http
GET /api/v1/query/history?page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

Legacy endpoint (deprecated, still supported):

```http
GET /api/v1/history?page=1&limit=10
```

Both routes use the same controller and return:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Auth Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/resend-otp`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`

## Export Endpoints

- `POST /api/v1/export/csv`
- `POST /api/v1/export/excel`
- `POST /api/v1/export/pdf`
- `GET /api/v1/export/history?page=1&limit=10&exportType=CSV`

## Scripts

```bash
npm run lint
npm run build
npm run test
npm run test:coverage
```

## Notes

- Query suggestions are generated as natural-language follow-up questions, not SQL strings.
- Auth routes are protected by a dedicated rate limiter: 5 attempts per 15 minutes.
- CORS is restricted to `CLIENT_URL` (with local dev origins in development mode).
