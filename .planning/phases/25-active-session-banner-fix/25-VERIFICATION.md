# Phase 25: Active Session Banner Fix — VERIFICATION

**Phase:** 25-active-session-banner-fix
**Verification Date:** 2026-03-11
**Method:** Code inspection + manual UAT
**Fix Commit:** 7e4e6e3 (v5.0 Emergency Hotfix)

---

## Requirements Coverage

| Requirement | Description | Status |
|---|---|---|
| BUG-03 | Active session banner persists visible after finishing workout | **PASS** |

---

## Success Criteria Verification

| # | Criteria | Status | Evidence |
|---|---|---|---|
| SC-1 | Banner desaparece en menos de 1 segundo al pulsar "Finalizar entrenamiento" | **PASS** | `window.dispatchEvent(new CustomEvent('workoutFinished'))` es sincrono y se ejecuta **antes** de `await action()` en `handleClick`. `ActiveSessionBanner` llama a `setActiveSession(null)` inmediatamente al recibir el evento — el estado React se actualiza antes de que la Server Action devuelva respuesta o navegue. |
| SC-2 | El banner sigue apareciendo cuando hay una sesion activa real en curso | **PASS** | El polling de 10 segundos en `useEffect` con dep `[pathname]` sigue operativo e inalterado. El evento `workoutFinished` solo se dispara cuando el usuario pulsa el boton de finalizar — no interfiere con el ciclo de fetch normal. |
| SC-3 | El banner no reaparece despues de finalizar (no hay regresion por re-fetch) | **PASS** | `finishWorkout` actualiza `completed=true` en `workout_sessions`. La query de polling en `fetchSession` filtra con `.eq('completed', false)` — en el siguiente ciclo de polling (hasta 10s despues), Supabase no devuelve la sesion completada, por lo que el banner no reaparece. |

---

## Code Inspection

Patrones verificados mediante inspeccion directa de codigo (Task 1):

| # | Archivo | Patron | Presente |
|---|---|---|---|
| 1 | `components/client/finish-workout-button.tsx` | `window.dispatchEvent(new CustomEvent('workoutFinished'))` antes de `await action()` | YES |
| 2 | `components/client/active-session-banner.tsx` | `window.addEventListener('workoutFinished', handleFinished)` en `useEffect` con deps `[]` | YES |
| 3 | `components/client/active-session-banner.tsx` | `setActiveSession(null)` + `setTotalSets(0)` + `setCompletedSets(0)` en `handleFinished` | YES |
| 4 | `app/(client)/today/actions.ts` | `.update({ completed: true, finished_at: ... })` + `redirect('/history')` sin error | YES |
| 5 | `app/(client)/workout/[sessionId]/page.tsx` | `finishAction = finishWorkout.bind(null, session.id)` + `<FinishWorkoutButton action={finishAction} />` | YES |

---

## UAT Sign-off

**Resultado del checkpoint (Task 2 — manual verification):**

> "aprobado — Los tres criterios verificados manualmente en la app"

Los tres criterios de exito de BUG-03 fueron verificados manualmente por el usuario:
- El banner desaparece instantaneamente al pulsar el boton (SC-1)
- El banner no reaparece en /history tras esperar el ciclo de polling (SC-2 / SC-3)
- El banner no aparece en /today tras finalizar la sesion (SC-3)

---

## Architecture Note — Por que CustomEvent es la eleccion correcta

### Problema de arquitectura

`FinishWorkoutButton` y `ActiveSessionBanner` son dos componentes sin relacion directa en el arbol de componentes. El banner vive en el layout del cliente (`app/(client)/layout.tsx`) mientras que el boton vive en la pagina de sesion (`app/(client)/workout/[sessionId]/page.tsx`). La distancia entre ellos hace inviable la comunicacion por props.

### Alternativas descartadas

| Alternativa | Por que no |
|---|---|
| **Zustand / Context global** | Overhead de nueva dependencia o Context complejo solo para un evento puntual. No justificado. |
| **Supabase Realtime** | Requiere subscripcion WebSocket activa. El polling ya cubre el caso de "nueva sesion" — anadir Realtime solo para la finalizacion seria sobrearquitectura. |
| **Server-side redirect puro** | El redirect de `finishWorkout` navega a `/history`, pero el banner hace polling cada 10s — entre el click y el proximo poll podria seguir visible hasta 10 segundos. |
| **router.refresh()** | Invalida el Server Component cache pero el banner es un Client Component con estado propio — `refresh()` no fuerza a cero su estado. |

### Por que CustomEvent funciona

1. **`dispatchEvent` es sincrono** — cuando `window.dispatchEvent(new CustomEvent('workoutFinished'))` retorna, todos los listeners ya han ejecutado. El handler de `ActiveSessionBanner` ha llamado a `setActiveSession(null)` antes de que empiece el `await action()`.

2. **React batching garantiza el render** — `setActiveSession(null)` en el handler sincrono se procesa en el siguiente tick de React, que ocurre antes de que la Server Action haga la navegacion a `/history`.

3. **Sin nuevas dependencias** — `CustomEvent` es API nativa del browser. Zero overhead de bundle.

4. **Patron idiomatico para comunicacion entre componentes distantes** — documentado como patron valid en React para casos donde Context/state-managers son exagerados.

5. **Cleanup correcto** — el `useEffect` con `return () => window.removeEventListener(...)` garantiza que no hay memory leaks cuando el banner se desmonta.

### Conclusion

CustomEvent es la solucion minima y correcta para este caso de uso especifico. No requiere estado global, no requiere subscripciones de red, no requiere nuevas librerias, y el comportamiento sincrono garantiza la inmediatez visual que requiere SC-1.

---

**BUG-03 — VERIFIED RESOLVED**
