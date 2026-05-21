# Land Tour & Travel - Plataforma Turística B2B

> Mayorista de turismo - Plataforma para agencias aliadas

## 🚀 Getting Started

### Requisitos

- Node.js 18+
- PostgreSQL (local o Supabase)

### Instalación

```bash
npm install
```

### Variables de entorno

Crea un archivo `.env` en `apps/admin`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/landtour"
NEXTAUTH_SECRET="tu-secret-aqui"
NEXTAUTH_URL="http://localhost:3001"
```

### Desarrollo

```bash
# Frontend público (http://localhost:3000)
npm run dev:web

# Panel admin + API (http://localhost:3001)
npm run dev:admin
```

### Build

```bash
npm run build    # Todo el monorepo
npm run build:web
npm run build:admin
```

---

## 📁 Estructura

```
apps/
├── web/          # Frontend público (Landing + Paquetes)
├── admin/         # Panel admin + API + Auth NextAuth
packages/
├── ui/           # Design system compartido
└── shared/        # Tipos, constantes, utilidades
```

---

## 🎨 Diseño

- **Colores:** #0B4339 (primary), #28BFA9 (secondary)
- **Frontend:** Montserrat
- **Admin:** Inter

## 📋 Estado - Fase 1 MVP

- [x] Landing Page
- [x] /paquetes con filtro dropdown
- [ ] Modal detalle paquete
- [ ] Modal aliados
- [ ] Login NextAuth
- [ ] Cotizador
- [ ] Panel Admin
- [ ] API + DB

---

## 📄 Documentación

Ver `docs/Agents.md` para información completa del proyecto.