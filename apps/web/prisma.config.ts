import { defineConfig } from "prisma/config";
import process from "node:process";

// Prisma 7 CLI no carga .env automáticamente cuando existe prisma.config.ts.
// Node.js 20.12+ tiene process.loadEnvFile() nativo — sin dependencias extra.
try { process.loadEnvFile(".env"); } catch {}

export default defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    url: process.env.DATABASE_URL,
  },
});
