import { PrismaClient } from "@prisma/client";

// Prevents exhausting DB connections from ts-node-dev / nodemon hot-reloads
// by reusing a single PrismaClient instance across reloads in development.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

// Replaces the old Sequelize `connectDb` (which also ran `sequelize.sync`).
// Prisma has no equivalent runtime "sync" step — schema changes are applied
// with `npx prisma migrate dev`, not at app boot. This just verifies the
// connection is reachable on startup.
export const connectDb = async () => {
  try {
    await prisma.$connect();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
