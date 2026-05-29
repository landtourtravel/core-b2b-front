import { defineConfig } from "prisma/config";

// prisma.config.ts — Configuración de Prisma 7 para apps/web
// En Prisma 7, la URL de conexión se declara aquí (no en schema.prisma).
// La variable DATABASE_URL se lee de .env.local en desarrollo.

export default defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    url: process.env.DATABASE_URL,
  },
});
