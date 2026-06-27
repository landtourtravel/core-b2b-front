import type { NextAuthConfig } from "next-auth";
import { encode as defaultEncode } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import type { UserRole } from "@land-tour/shared";

// ── Duración de sesión según "Mantener sesión iniciada" ───────────────────────
// Sin remember → 2 horas. Con remember → 1 día.
const REMEMBER_MAX_AGE = 24 * 60 * 60; // 1 día (segundos)
const DEFAULT_MAX_AGE  =  2 * 60 * 60; // 2 horas (segundos)

// ── Extensión de tipos NextAuth v5 ────────────────────────────────────────────
declare module "next-auth" {
  interface User {
    role: UserRole;
    agenciaId: string;
    agenciaNombre: string;
    remember?: boolean;
  }
  interface Session {
    user: {
      role: UserRole;
      agenciaId: string;
      agenciaNombre: string;
    } & import("next-auth").DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    remember?: boolean;
  }
}

// Config Edge-compatible: solo valida el JWT — authorize real está en auth.ts
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Correo",     type: "email"    },
        password: { label: "Contraseña", type: "password" },
        remember: { label: "Recordar",   type: "text"     },
      },
      // authorize se sobreescribe en auth.ts (Node.js runtime)
      async authorize() { return null; },
    }),
  ],
  // ── Override del encode del JWT ─────────────────────────────────────────────
  // NextAuth v5 (@auth/core) SIEMPRE calcula `exp = now + maxAge` dentro de
  // `encode()`, ignorando cualquier `token.exp` que se asigne en el callback jwt.
  // Por eso la duración por-usuario NO se puede lograr seteando `token.exp`.
  // La forma fiable es interceptar `encode` y pasar el `maxAge` correcto según
  // `token.remember`. `decode` se deja en el default (valida el `exp` del token).
  jwt: {
    async encode(params) {
      const remember = (params.token as { remember?: boolean } | undefined)?.remember === true;
      return defaultEncode({
        ...params,
        maxAge: remember ? REMEMBER_MAX_AGE : DEFAULT_MAX_AGE,
      });
    },
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id            = user.id;
        token.role          = (user as any).role;
        token.agenciaId     = (user as any).agenciaId;
        token.agenciaNombre = (user as any).agenciaNombre;
        token.remember      = (user as any).remember ?? false;
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
    // maxAge debe ser >= REMEMBER_MAX_AGE para que la cookie viva lo suficiente.
    // La expiración REAL del JWT la fija `jwt.encode` según `token.remember`:
    // sin remember el token caduca en 2h aunque la cookie persista 24h.
    maxAge:    REMEMBER_MAX_AGE, // 24h (máximo posible)
    updateAge: 30 * 60,          // refresca el JWT cada 30 min con actividad
  },
};
