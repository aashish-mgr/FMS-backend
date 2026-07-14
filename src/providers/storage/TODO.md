# Storage providers — not yet converted

Nothing in the Sequelize source implemented file attachments/storage, so
there was nothing to convert here. This folder is scaffolded per the SRS
(Section 3.3 / Section 17.1) so the shape is ready when you build it:

```
src/providers/storage/
├── StorageService.ts       # interface: upload(), delete(), getUrl()
├── LocalStorageProvider.ts # implements StorageService, writes to disk
├── CloudinaryProvider.ts   # implements StorageService, calls Cloudinary SDK
└── index.ts                # factory: returns the provider based on
                             # process.env.STORAGE_PROVIDER ("local" | "cloudinary")
```

Application code (e.g. an attachment.service.ts) should only ever import the
factory from `index.ts`, never `LocalStorageProvider` or `CloudinaryProvider`
directly — that's what lets you swap providers via an env var with zero
code changes, per the SRS's "File Storage Architecture" requirement.
