/**
 * Database configuration and initialization
 */
import { PrismaClient } from "@prisma/client";

/**
 * Create and export Prisma client
 */
export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["warn", "error"],
});

/**
 * Connect to database
 */
export async function connectDatabase(): Promise<void> {
  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log("[Database] Connected successfully");
  } catch (error) {
    console.error("[Database] Connection failed:", error);
    throw error;
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log("[Database] Disconnected");
}
