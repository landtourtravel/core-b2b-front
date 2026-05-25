import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { UserRole } from '@land-tour/shared';

// ── Extensión de tipos NextAuth v5 ────────────────────────────────────────────
declare module 'next-auth' {
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
    } & DefaultSession['user'];
  }
}

// ── Usuarios mock — TODO: reemplazar con query Prisma + bcrypt.compare ────────
// Cada agencia tiene su propio admin y colaboradores.
// El superadmin de Kevin está en lt-core-admin (otro subdominio, otro repo).
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@agenciademo.com',
    password: 'Admin123*',
    name: 'Ana Torres',
    role: 'ADMIN' as UserRole,
    agenciaId: 'agencia-001',
    agenciaNombre: 'Agencia Demo Tours',
  },
  {
    id: '2',
    email: 'colaborador@agenciademo.com',
    password: 'Colab123*',
    name: 'Carlos Ruiz',
    role: 'COLABORADOR' as UserRole,
    agenciaId: 'agencia-001',
    agenciaNombre: 'Agencia Demo Tours',
  },
  {
    id: '3',
    email: 'admin@viajespremium.com',
    password: 'Admin123*',
    name: 'María López',
    role: 'ADMIN' as UserRole,
    agenciaId: 'agencia-002',
    agenciaNombre: 'Viajes Premium SAS',
  },
];

// ── Config NextAuth ───────────────────────────────────────────────────────────
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // TODO: reemplazar con:
        // const user = await prisma.user.findUnique({
        //   where: { email: String(credentials.email) },
        //   include: { agencia: { select: { id: true, nombre: true } } },
        // })
        // if (!user || !await bcrypt.compare(String(credentials.password), user.passwordHash)) return null
        const user = MOCK_USERS.find(
          (u) =>
            u.email === credentials.email &&
            u.password === credentials.password
        );

        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          agenciaId: user.agenciaId,
          agenciaNombre: user.agenciaNombre,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.agenciaId = user.agenciaId;
        token.agenciaNombre = user.agenciaNombre;
      }
      return token;
    },
    session({ session, token }) {
      if (token.role) {
        session.user.role = token.role as UserRole;
        session.user.agenciaId = token.agenciaId as string;
        session.user.agenciaNombre = token.agenciaNombre as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 días
  },
});
