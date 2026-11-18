# FMS-backend

Multi-tenant finance management API for the FMS project. The API uses a shared
PostgreSQL schema with row-level `tenantId` isolation, JWT access tokens, and
database-backed refresh tokens stored in an HttpOnly cookie.

## API documentation

- Swagger UI: `http://localhost:3000/api-docs`
- Raw OpenAPI JSON: `http://localhost:3000/api-docs.json`
- Validate the spec and check it against the Express routes:

```bash
npm run docs:validate
```

The static OpenAPI document lives in `src/config/openapi`. It covers every
Express operation, including bearer authentication, the refresh-token cookie,
RBAC permission notes, request bodies, success/error responses, report binary
formats, and attachment upload, list, download, and delete operations.

## Development

```bash
npm install
npx prisma migrate dev
npm start
```

`npm start` runs the TypeScript entry point with nodemon. Use `npx prisma migrate
deploy` in production rather than `prisma migrate dev`.

## Attachments and storage

Attachments are stored through a provider selected by `STORAGE_PROVIDER`:

- `cloudinary` (recommended for production): files are uploaded as private
  authenticated assets under `CLOUDINARY_FOLDER/<tenantId>/<entityType>`. The
  API returns a short-lived signed download URL through
  `GET /api/<entityType>/<entityId>/attachments/<attachmentId>/download`.
- `local`: development fallback that writes to `LOCAL_UPLOAD_PATH`.

Cloudinary requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
`CLOUDINARY_API_SECRET` when selected. The API key must have **Create/Upload**
permission; a key that only allows read/management requests will be rejected by
Cloudinary with `Request forbidden due to missing permissions (actions=["create"])`.

Attachment endpoints require the `attachment:read`, `attachment:create`, or
`attachment:delete` permission. Uploaded files are limited to PDF, JPG, JPEG,
and PNG, with a 10 MB default per-file limit and up to 10 files per request.
