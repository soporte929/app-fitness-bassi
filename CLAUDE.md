# CLAUDE.md — Fitness Bassi

> Léelo completo antes de tocar cualquier archivo.
> Responde siempre en español. Sé conciso. Solo lo esencial.

---

## 🧠 Qué es esta aplicación

**Fitness Bassi** es una plataforma de entrenamiento y nutrición para el entrenador personal **Bassi**. Dos tipos de usuario:

- **Cliente (`role: 'client'`)**: registra entrenos, sigue su nutrición, ve su progreso.
- **Entrenador (`role: 'trainer'`)**: supervisa clientes, crea planes, ajusta objetivos.

Stack: Next.js 16, TypeScript strict, Tailwind v4, Supabase SSR+RLS, shadcn/ui, Recharts, Lucide.

---

## ⚠️ Estado actual — v5.0 (11 Marzo 2026) — LEE ESTO PRIMERO

### Milestones completados
- v1.0 → v4.2: ✅ Completados (ver ROADMAP.md)
- v5.0 Phase 24 — Middleware prefix fix: ✅ Completado 11-03-2026

### Completado recientemente
- Phase 25 ✅ Banner "Entrenamiento activo" — completado 11-03-2026
- Phase 28 ✅ /progress page full fix — completado 11-03-2026

### Pendiente inmediato — ejecutar en orden
1. **Phase 29** 🟢 MEJORA: Promise.all en queries secuenciales + unstable_cache + índices Supabase
2. **Phase 30** 🔴 CRÍTICO: Eliminar asignación directa Rutina→Cliente, forzar flujo Rutina→Plan→Cliente
3. **Phase 33** 🔴 CRÍTICO: `/nutrition-plans` roto en prod (diet_type schema cache Supabase)

### Variables de entorno críticas
- `ANTHROPIC_API_KEY` → añadir manualmente en Vercel dashboard (producción ≠ local)
- Producción: Railway/Vercel. NUNCA asumir que `.env.local` está en prod.

### IDs de referencia
- Trainer (Bassi) profile_id: `8f500a88-a31d-45c5-9470-9cd09a2f793a`
- Cliente prueba (Pedro) client_id: `24646591-53ec-4d1a-b92a-08f00e8d365b`

---

## 🚨 Reglas Críticas — NEVER / ALWAYS

- NEVER uses `any` en TypeScript. Tipos siempre desde `lib/supabase/types.ts`
- NEVER hardcodees datos. Si no tienes la query, pon `// TODO:`
- NEVER modifiques `schema.sql` directamente. Usa migraciones Supabase
- NEVER expongas la Anthropic API key en el cliente
- NEVER hagas fetch de datos en componentes `'use client'`
- NEVER añadas librerías sin confirmación
- ALWAYS Server Components por defecto. `'use client'` solo para estado interactivo
- ALWAYS RLS policies en cada tabla Supabase. Sin excepciones
- ALWAYS manejo de errores con try/catch en toda operación async
- ALWAYS envuelve el contenido de página en `<PageTransition>`
- ALWAYS especifica columnas en queries. Nunca `SELECT *`
- ALWAYS columnas `diet_type`, `meals_count`, `is_template` en nutrition_plans

---

## 🧠 Context Management

- Usar `/context` cada 15-20 minutos para monitorizar tokens
- Al 50% de contexto: `/clear` + `/catchup` (NO `/compact` — puede perder info crítica)
- `/clear` OBLIGATORIO al cambiar de phase
- Para bugs complejos: añadir **ULTRATHINK** al prompt
- Tests SIEMPRE en sesión separada a la implementación
- GSD: `/gsd:discuss-phase` SIEMPRE falla — saltarlo, ir directo a `/gsd:plan-phase`

---

## 🎨 Design System

### Paleta de colores
```
Fondo página:        bg-[#f5f5f7]
Fondo card:          bg-white
Texto principal:     text-[#1d1d1f]
Texto secundario:    text-[#6e6e73]
Texto terciario:     text-[#aeaeb2]
Bordes:              border-[#e5e5ea]
Azul primario:       #0071e3  (botones, links, foco)
Verde:               #30d158  (completado, éxito)
Amarillo:            #ff9f0a  (warning, PRs, rachas)
Rojo:                #ff375f  (error, alertas críticas)
```

NUNCA hardcodees colores dark como `#191919`, `#212121`, `#111111`. Usa CSS vars.

### Componentes disponibles
```tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'         // variants: default | ghost
import { StatusBadge } from '@/components/ui/badge'     // status: 'green' | 'yellow' | 'red'
import { AlertBanner } from '@/components/ui/alert-banner'
import { StatCard } from '@/components/ui/stat-card'
import { MiniChart } from '@/components/ui/mini-chart'
import { PageTransition } from '@/components/ui/page-transition'
```

### Animaciones de lista
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
Título página:    text-2xl font-bold text-[#1d1d1f] tracking-tight
Título sección:   text-base font-semibold text-[#1d1d1f]
Label uppercase:  text-xs font-medium text-[#6e6e73] uppercase tracking-wider
Body:             text-sm text-[#6e6e73]
Dato numérico:    text-2xl font-bold text-[#1d1d1f]
```

Iconos: exclusivamente **Lucide React**.

---

## 🗂️ Estructura de rutas

```
app/
├── (auth)/login/
├── (client)/
│   ├── layout.tsx
│   ├── today/page.tsx
│   ├── workout/[sessionId]/
│   ├── routines/
│   ├── history/
│   ├── progress/page.tsx          ← Phase 28 pendiente
│   ├── nutrition/page.tsx
│   └── profile/page.tsx
├── (trainer)/
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── clients/page.tsx
│   ├── clients/[id]/page.tsx
│   ├── routines-templates/        ← prefix fix ya aplicado (Phase 24)
│   ├── nutrition-plans/           ← prefix fix ya aplicado (Phase 24)
│   └── exercises/
middleware.ts                      ← NO tocar sin revisar prefix collision
```

---

## 🗄️ Base de datos Supabase

Tipos en `lib/supabase/types.ts`. Úsalos siempre, no redefinas.

```typescript
import type { Database } from '@/lib/supabase/types'
type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row']
type SetLog = Database['public']['Tables']['set_logs']['Row']
type Exercise = Database['public']['Tables']['exercises']['Row']
```

### Relaciones clave — Entreno
```
workout_plans → workout_days → exercises → set_logs (via workout_sessions)
workout_sessions: client_id → clients.id | day_id → workout_days.id
```

### Relaciones clave — Nutrición
```
nutrition_plans → meal_plan_items → foods
food_log: client_id → clients.id
client_measurements: client_id → clients.id  ← SIEMPRE filtrar por client_id, NO profile_id
```

### Flujo de negocio OBLIGATORIO
```
Rutinas (templates) → Planes semanales → Asignación al Cliente
```
- NUNCA asignar una rutina directamente a un cliente
- NUNCA saltarse el paso Plan
- Botón en detalle cliente: "Asignar plan" (NO "Asignar rutina")

### Query típica sesión activa
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

### Patrón Server Component correcto
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('tabla')
    .select('col1, col2')
    .eq('client_id', clientId)

  if (error) return <ErrorState message={error.message} />
  if (!data?.length) return <EmptyState />

  return <PageTransition>...</PageTransition>
}
```

---

## 🔐 Autenticación

- El middleware gestiona toda la protección. No añadas lógica auth en páginas.
- Para operaciones admin (INSERT en `clients`): usar **service role**, nunca anon key.
- Para obtener usuario en Server Component:

```tsx
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')
```

---

## 🤖 Claude API

- SDK: `@anthropic-ai/sdk`
- Modelo: `claude-sonnet-4-20250514`
- Llamadas SIEMPRE server-side (Server Actions o Route Handlers)
- `ANTHROPIC_API_KEY` en `.env.local` local y en Vercel dashboard en producción

---

## ⚙️ Convenciones de código

- TypeScript strict: sin `any`
- Server Components por defecto. `'use client'` solo para estado interactivo
- Server Actions para mutaciones. Archivo `actions.ts` dentro de la ruta
- `cn()` de `@/lib/utils` para clases condicionales
- Imports con `@/` siempre
- Nombrado: componentes PascalCase, funciones camelCase, archivos kebab-case
- Máximo 200 líneas por archivo. Si excede, refactorizar

---

## ✅ Checklist antes de entregar cada phase

- [ ] Datos vienen de Supabase (no hardcodeados)
- [ ] Tipos correctos de `lib/supabase/types.ts`
- [ ] Envuelto en `<PageTransition>`
- [ ] Colores y componentes del design system
- [ ] Loading state + empty state implementados
- [ ] Probado con user `client` Y `trainer`
- [ ] Sin `any` en TypeScript
- [ ] RLS policies verificadas
- [ ] Variables de entorno en Vercel si hay nuevas keys