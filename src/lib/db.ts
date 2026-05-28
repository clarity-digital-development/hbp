import { PrismaClient } from "@prisma/client";

// Singleton Prisma client. The constructor does not open a connection until the
// first query, so this is safe to import even when DATABASE_URL isn't set yet
// (queries simply fail and are handled by the caller).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
