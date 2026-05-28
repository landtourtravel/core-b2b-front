import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { UserRole } from "@land-tour/shared";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

// ── Fallback mock — solo para dev sin DB ──────────────────────────────────────
const MOCK_USERS = [
  { id: "1", email: "admin@agenciademo.com",       password: "Admin123*", name: "Ana Torres",  role: "ADMIN" as UserRole,       agenciaId: "agencia-001", agenciaNombre: "Agencia Demo Tours" },
  { id: "2", email: "colaborador@agenciademo.com", password: "Colab123*", name: "Carlos Ruiz", role: "COLABORADOR" as UserRole, agenciaId: "agencia-001", agenciaNombre: "Agencia Demo Tours" },
  { id: "3", email: "admin@viajespremium.com",     password: "Admin123*", name: "María López", role: "ADMIN" as UserRole,       agenciaId: "agencia-002", agenciaNombre: "Viajes Premium SAS" },
];

// ── Config completa (Node.js runtime — con Prisma + bcrypt) ──────────────────
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Correo",     type: "email"    },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email    = String(credentials.email);
        const password = String(credentials.password);

        try {
          const user = await prisma.usuarioAgencia.findUnique({
            where: { email },
            include: { agencia: { select: { id: true, nombre: true } } },
          });

          if (!user || !user.password || !user.agencia) return null;

          const passwordOk =
            (await bcrypt.compare(password, user.password)) ||
            user.password === password; // fallback plain-text (dev seed)

          if (!passwordOk) return null;

          return {
            id:            user.id,
            email:         user.email ?? "",
            name:          user.name  ?? "",
            role:          (user.role as UserRole) ?? "COLABORADOR",
            agenciaId:     user.agencia.id,
            agenciaNombre: user.agencia.nombre,
          };
        } catch {
          const mock = MOCK_USERS.find(
            (u) => u.email === email && u.password === password
          );
          if (!mock) return null;
          return { id: mock.id, email: mock.email, name: mock.name, role: mock.role, agenciaId: mock.agenciaId, agenciaNombre: mock.agenciaNombre };
        }
      },
    }),
  ],
});
