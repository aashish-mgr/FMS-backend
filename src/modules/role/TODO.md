# Role module — not yet converted

No `roleController` / `roleRoute` existed in the Sequelize source — roles
were only ever created by `roleSeeder.ts` and attached via the
`User.$add("roles", ...)` call in `adminSeeder.ts`. Both are now converted
in `prisma/seed.ts` (`seedRoles` / `seedAdmin`).

The `Role` and `UserRole` models (the explicit many-to-many join, matching
the original `userRole.ts` model) are fully defined in
`prisma/schema.prisma`.

When you build CRUD/assignment endpoints for this module, follow the
pattern in `src/modules/income/`. A typical role-assignment call in Prisma
looks like:

```ts
await prisma.userRole.create({ data: { userId, roleId } });
```
