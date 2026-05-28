import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { UserRole } from "@land-tour/shared";

// ── Extensión de tipos NextAuth v5 ────────────────────────────────────────────
declare module "next-auth" {
  interface User {
    role: UserRole;
    agenciaId: string;
    agenciaNombre: string;
  }
  interface Session {
    user: {
      role: UserRole;
      agenciaId: string;
      agenciaNombre: string;
    } & import("next-auth").DefaultSession["user"];
  }
}

// Config Edge-compatible: solo valida el JWT — authorize real está en auth.ts
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Correo",     type: "email"    },
        password: { label: "Contraseña", type: "password" },
      },
      // authorize se sobreescribe en auth.ts (Node.js runtime)
      async authorize() { return null; },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id           = user.id;
        token.role         = (user as any).role;
        token.agenciaId    = (user as any).agenciaId;
        token.agenciaNombre = (user as any).agenciaNombre;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        (session.user as any).id            = token.id;
        (session.user as any).role          = token.role;
        (session.user as any).agenciaId     = token.agenciaId;
        (session.user as any).agenciaNombre = token.agenciaNombre;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  session: {
    strategy: "jwt",
    maxAge:   7 * 24 * 60 * 60,
  },
};
