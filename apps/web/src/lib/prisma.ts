import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Limit concurrent connections — Supabase free tier allows max 15.
    // Using 3 keeps the pool small and avoids connection exhaustion on hot-reloads.
    max: 3,
    // Release idle connections after 30 seconds to avoid stale connections
    // to Supabase which closes idle connections after ~5 minutes.
    idleTimeoutMillis: 30_000,
    // Fail fast if a new connection cannot be established within 10 seconds.
    // Without this, the app hangs indefinitely on network issues.
    connectionTimeoutMillis: 10_000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
