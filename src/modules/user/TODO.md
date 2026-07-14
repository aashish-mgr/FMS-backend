# User module — not yet converted

No `userController` / `userRoute` existed in the Sequelize source (the
`User` model was only ever touched by `authController.login` and the admin
seeder). The `User` model is fully defined in `prisma/schema.prisma`.

When you build this module, follow the pattern in `src/modules/income/`:

```
user.routes.ts       # express.Router()
user.controller.ts   # thin req/res layer, delegates to the service
user.service.ts       # prisma.user.findMany / findFirst / update / soft delete
user.validation.ts   # zod schemas for create/update payloads
```

Remember: every read should filter `deletedAt: null` (see
`income.service.ts` for the pattern), since `User` has a `deletedAt` column
but Prisma doesn't enforce soft deletes automatically.
