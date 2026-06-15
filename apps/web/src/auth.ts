import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { UserRole } from "@land-tour/shared";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

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

        const user = await prisma.usuarioAgencia.findUnique({
          where: { email },
          include: { agencia: { select: { id: true, nombre: true } } },
        });

        if (!user || !user.password || !user.agencia) return null;

        const passwordOk = await bcrypt.compare(password, user.password);
        if (!passwordOk) return null;

        return {
          id:            user.id,
          email:         user.email ?? "",
          name:          user.name  ?? "",
          role:          (user.role as UserRole) ?? "ASESOR_MINORISTA",
          agenciaId:     user.agencia.id,
          agenciaNombre: user.agencia.nombre,
        };
      },
    }),
  ],
});
