# CLAUDE.md — Fitness Bassi · Antigravity Workspace

> Este archivo es el contrato de trabajo para Claude Code en este repositorio.
> Léelo completo antes de tocar cualquier archivo.

---

## 🧠 Qué es esta aplicación

**Fitness Bassi** es una plataforma de entrenamiento y nutrición para un entrenador personal llamado **Bassi**. Tiene dos tipos de usuario:

- **Cliente (`role: 'client'`)**: registra entrenos, sigue su nutrición, ve su progreso.
- **Entrenador (`role: 'trainer'`)**: supervisa y gestiona todos sus clientes, crea planes, ajusta objetivos.

La app está inspirada en **Hevy** pero añade seguimiento trainer→cliente con IA (Claude API).

---

## ⚠️ Estado actual del proyecto — LEE ESTO PRIMERO

### Lo que YA existe y funciona

| Archivo | Estado | Notas |
|---|---|---|
| `middleware.ts` | ✅ Completo | Protección por rol, bypass dev activo |
| `lib/supabase/types.ts` | ✅ Completo | Tipos para todas las tablas |
| `lib/supabase/client.ts` | ✅ Completo | Cliente browser |
| `lib/supabase/server.ts` | ✅ Completo | Cliente server con cookies |
| `lib/calculations/nutrition.ts` | ✅ Completo | Fórmulas Cunningham, Tinsley, GET |
| `lib/alerts.ts` | ✅ Completo | Motor de alertas con `computeAlerts()` |
| `lib/utils.ts` | ✅ Completo | `cn()` y utilidades |
| `components/ui/` | ✅ Completo | Card, Button, Badge, AlertBanner, StatCard, MiniChart, PageTransition |
| `components/client/nav.tsx` | ✅ Completo | Nav bottom del cliente |
| `components/client/sidebar.tsx` | ✅ Completo | Sidebar del cliente |
| `components/trainer/sidebar.tsx` | ✅ Completo | Sidebar del trainer |
| `app/(trainer)/dashboard/page.tsx` | ✅ UI completa | **Datos hardcodeados** — falta conectar Supabase |
| `app/(client)/today/page.tsx` | ✅ UI completa | **Datos hardcodeados** — falta conectar Supabase |
| `app/(client)/nutrition/page.tsx` | 🟡 Existe | Estado desconocido |
| `app/(client)/progress/page.tsx` | 🟡 Existe | Estado desconocido |
| `app/(client)/profile/page.tsx` | 🟡 Existe | Estado desconocido |
| `app/(trainer)/clients/page.tsx` | 🟡 Existe | Estado desconocido |
| `app/(trainer)/clients/[id]/page.tsx` | 🟡 Existe | Estado desconocido |

### Lo que NO existe todavía (hay que construir)

- `app/(client)/workout/[sessionId]/` — sesión activa con timer
- `app/(client)/routines/` — listado de rutinas
- `app/(client)/history/` — feed de entrenos pasados
- `app/(trainer)/clients/[id]/plan/` — gestión del plan del cliente
- Conexión real a Supabase en las páginas existentes

---

## 🚨 Problema crítico a resolver antes de cualquier feature nueva

**`today/page.tsx` y `dashboard/page.tsx` tienen datos hardcodeados y son `'use client'` cuando deberían ser Server Components.**

**Patrón correcto a seguir en TODAS las páginas:**

```tsx
// ✅ CORRECTO — Server Component con datos reales
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id, weight_kg, phase, goal')
    .eq('profile_id', user.id)
    .single()

  return <div>...</div>
}

// ❌ INCORRECTO — No hagas esto en páginas nuevas
'use client'
const hardcodedData = [{ id: 1, name: 'Carlos' ... }]
```

La excepción son componentes que necesitan estado interactivo (timer, inputs de series) → esos sí son `'use client'`, pero reciben los datos como props desde el Server Component padre.

---

## 🎨 Design System — Patrones establecidos

> Estos colores y clases están en uso en el repo. No los cambies ni inventes otros.

### Paleta de colores
```
Fondo página:        bg-[#f5f5f7]
Fondo card:          bg-white
Texto principal:     text-[#1d1d1f]     → #1d1d1f
Texto secundario:    text-[#6e6e73]     → #6e6e73
Texto terciario:     text-[#aeaeb2]     → #aeaeb2
Bordes:              border-[#e5e5ea]   → #e5e5ea
Azul primario:       #0071e3  (botones, links, foco)
Verde:               #30d158  (completado, éxito)
Amarillo:            #ff9f0a  (warning, PRs, rachas)
Rojo:                #ff375f  (error, alertas críticas)
```

### Componentes disponibles
```tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// variants: default | ghost   sizes: sm | md | lg

import { StatusBadge } from '@/components/ui/badge'
// status: 'green' | 'yellow' | 'red'

import { AlertBanner } from '@/components/ui/alert-banner'
import { StatCard } from '@/components/ui/stat-card'
import { MiniChart } from '@/components/ui/mini-chart'
import { PageTransition } from '@/components/ui/page-transition'
```

**Regla: envuelve siempre el contenido de la página en `<PageTransition>`.**

### Animaciones de lista (patrón establecido)
```tsx
<div className="stagger">
  {items.map((item, i) => (
    <div key={item.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
      ...
    </div>
  ))}
</div>
```

### Tipografía
```
Título de página:    text-2xl font-bold text-[#1d1d1f] tracking-tight
Título de sección:   text-base font-semibold text-[#1d1d1f]
Label uppercase:     text-xs font-medium text-[#6e6e73] uppercase tracking-wider
Body:                text-sm text-[#6e6e73]
Dato numérico:       text-2xl font-bold text-[#1d1d1f]
```

### Iconos — exclusivamente Lucide React
```tsx
import { CheckCircle2, ChevronDown, Trophy, Flame, ... } from 'lucide-react'
```

---

## 🗂️ Estructura de rutas

```
app/
├── (auth)/login/              ✅ existe
├── (client)/
│   ├── layout.tsx             ✅ existe
│   ├── today/page.tsx         ✅ UI lista — conectar Supabase
│   ├── workout/[sessionId]/   ❌ por construir
│   ├── routines/              ❌ por construir
│   ├── history/               ❌ por construir
│   ├── progress/page.tsx      🟡 existe
│   ├── nutrition/page.tsx     🟡 existe
│   └── profile/page.tsx       🟡 existe
├── (trainer)/
│   ├── layout.tsx             ✅ existe
│   ├── dashboard/page.tsx     ✅ UI lista — conectar Supabase
│   ├── clients/page.tsx       🟡 existe
│   └── clients/[id]/page.tsx  🟡 existe
middleware.ts                  ✅ completo
```

---

## 🗄️ Base de datos Supabase

Tipos en `lib/supabase/types.ts`. Úsalos siempre, no redefinas tipos.

```typescript
import type { Database } from '@/lib/supabase/types'
type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row']
type SetLog = Database['public']['Tables']['set_logs']['Row']
type Exercise = Database['public']['Tables']['exercises']['Row']
```

### Relaciones clave para entreno
```
workout_plans
  └── workout_days
        └── exercises
              └── set_logs (via workout_sessions)

workout_sessions
  ├── client_id → clients.id
  ├── day_id    → workout_days.id
  └── set_logs  → exercise_id → exercises.id
```

### Query típica de sesión activa
```typescript
const { data: session } = await supabase
  .from('workout_sessions')
  .select(`
    id, started_at, completed,
    day:workout_days (
      name,
      exercises (
        id, name, muscle_group, target_sets, target_reps, target_rir, order_index,
        set_logs (set_number, weight_kg, reps, rir, completed)
      )
    )
  `)
  .eq('id', sessionId)
  .single()
```

**Nunca uses `SELECT *`. Especifica siempre las columnas.**

---

## 🔐 Autenticación

- El middleware gestiona toda la protección. No añadas lógica de auth en páginas.
- **⚠️ El bypass de desarrollo está activo** (`NODE_ENV === 'development'`). Quitar antes de producción.
- Para obtener el usuario en un Server Component:

```tsx
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')
```

---

## ⚙️ Convenciones de código

- **TypeScript estricto**: sin `any`. Usa los tipos de `lib/supabase/types.ts`.
- **Server Components por defecto**. `'use client'` solo para estado interactivo.
- **Server Actions** para mutaciones. Archivo `actions.ts` dentro de la ruta correspondiente.
- **`cn()`** de `@/lib/utils` para clases condicionales.
- Imports con `@/` siempre.
- Nombrado: componentes PascalCase, funciones camelCase, archivos kebab-case.

---

## 🤖 Claude API

- SDK `@anthropic-ai/sdk` instalado.
- Modelo: `claude-sonnet-4-20250514`.
- Llamadas **siempre server-side** (Server Actions o Route Handlers `/app/api/`).
- Casos de uso planificados: cuestionario inicial, análisis de progreso, generación de planes.

---

## 🚦 División de trabajo

### Dev A — Módulo Entreno
`(client)/workout/`, `(client)/routines/`, `(client)/history/`
Tablas: `workout_sessions`, `set_logs`, `exercises`, `workout_days`, `workout_plans`

### Dev B — Módulo Métricas + Trainer
`(client)/progress/`, `(client)/nutrition/`, `(trainer)/`
Tablas: `weight_logs`, `measurements`, `nutrition_logs`, `clients`

### Compartidos — avisar antes de modificar
`middleware.ts` · `lib/supabase/types.ts` · `components/ui/` · `supabase/schema.sql`

### Git
- Rama por feature: `feature/workout-session`, `feature/connect-dashboard`…
- Nunca directamente a `main`. PR con descripción de rutas y tablas afectadas.

---

## ❌ Prohibido

- Hardcodear datos. Si no tienes la query lista, pon un `// TODO:` comment.
- Fetch de datos en componentes `'use client'`.
- Añadir librerías sin consultarlo.
- Tocar módulos del otro dev sin avisar.
- Exponer la Anthropic API key en el cliente.

---

## ✅ Checklist antes de entregar

- [ ] Los datos vienen de Supabase (no hardcodeados)
- [ ] Tipos correctos de `lib/supabase/types.ts`
- [ ] Envuelto en `<PageTransition>`
- [ ] Colores y componentes del design system
- [ ] Loading state + empty state implementados
- [ ] Probado con user `client` Y `trainer`
## Comportamiento
- Responde siempre en español
- Sé conciso, sin explicaciones innecesarias
- Solo lo esencial
```

Y en GSD específicamente, en `.claude/config.json` puedes cambiar el perfil:
```
/gsd:set-profile budget