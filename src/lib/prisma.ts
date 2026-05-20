import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import fs from "fs";
import path from "path";

// Helper to get DATABASE_URL from .env file directly to prevent system env override issues
function getDatabaseUrl() {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const match = envContent.match(/^DATABASE_URL=["']?(.*?)["']?$/m);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch (error) {
    console.error("Failed to read .env file:", error);
  }
  return process.env.DATABASE_URL;
}

const connectionString = getDatabaseUrl();

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Force delete any previously cached prisma instance from globalThis to pick up the new connection string
delete (globalThis as any).prisma;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
