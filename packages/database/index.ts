import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "./generated/prisma/client.js";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Neon always expects TLS; dashboard URLs usually include ?sslmode=require. */
function hostRequiresNeonTls(hostname: string): boolean {
  return hostname === "neon.tech" || hostname.endsWith(".neon.tech");
}

/** TLS for hosted Postgres (Neon, Supabase, RDS, etc.). See https://www.postgresql.org/docs/current/libpq-ssl.html */
function resolvePoolSsl(connectionString: string): pg.PoolConfig["ssl"] | undefined {
  const fromEnv = process.env.DATABASE_SSL?.trim().toLowerCase();
  if (fromEnv === "disable" || fromEnv === "0" || fromEnv === "false") {
    return undefined;
  }
  if (fromEnv === "require" || fromEnv === "true" || fromEnv === "1") {
    return {
      rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "0",
    };
  }

  try {
    const url = new URL(connectionString.replace(/^postgres(ql)?:/i, "http:"));
    const mode = url.searchParams.get("sslmode")?.toLowerCase();
    if (mode === "require") {
      return {
        rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "0",
      };
    }
    if (mode === "verify-ca" || mode === "verify-full") {
      return { rejectUnauthorized: true };
    }
    if (mode === "disable" || mode === "allow") {
      return undefined;
    }
    if (hostRequiresNeonTls(url.hostname)) {
      return { rejectUnauthorized: true };
    }
  } catch {
    // ignore invalid URL
  }
  return undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for PrismaClient");
  }

  const ssl = resolvePoolSsl(connectionString);
  const pool = new pg.Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX ?? 20),
    connectionTimeoutMillis: Number(
      process.env.DATABASE_POOL_CONNECTION_TIMEOUT_MS ?? 30_000,
    ),
    idleTimeoutMillis: 30_000,
    keepAlive: true,
    ...(ssl ? { ssl } : {}),
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { PrismaClient, Prisma } from "./generated/prisma/client.js";
export * from "./generated/prisma/enums.js";
