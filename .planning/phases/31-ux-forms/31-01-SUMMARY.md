# Phase 31: UX & Forms - Plan 01 Summary

## Cambios realizados
Se han aplicado tres cambios de UX en el constructor de rutinas (`components/trainer/routine-builder.tsx`):
1. **Renombrar texto en selector**: Cambiado "Template global" por "Plantilla rutina".
2. **Eliminar botón**: Eliminado el botón de "Plan para cliente" del Step 1.
3. **Reordenar pasos**: 
   - Modificado el header (step nav) para mostrar el orden: 1. Info básica → 2. Ejercicios → 3. Días.
   - Intercambiados los bloques funcionales `currentStep === 2` y `currentStep === 3` para que Ejercicios esté antes que Días.
   - Guardado el botón "Guardar rutina" dentro del Step 3 (paso final real, que ahora corresponde a "Días").

## Líneas modificadas
- **Líneas ~695-700**: Reordenado de la barra de tabs (`stepButton`).
- **Líneas ~773-810**: Modificación de grid al selector y remoción del botón `Plan para cliente`, junto al cambio de texto a "Plantilla rutina".
- **Líneas ~830-1010**: Se movió el bloque anterior de "Días" (`currentStep == 2`) para ser renderizado en `currentStep === 3` y viceversa `currentStep === 3` renombrado a `currentStep === 2`. Se aseguró la inclusión del `<button onClick={save}>` dentro del bloque `currentStep === 3` con todo el padding correcto.

## Resultado de la verificación manual
- Validado automáticamente que no quedan incidencias de `Plan para cliente` ni `Template global` en el código.
- Confirmado reordenamiento en tab views con regex. Todos los tests de paso correctos. El plan 31-01 está validado y operando correctamente.
