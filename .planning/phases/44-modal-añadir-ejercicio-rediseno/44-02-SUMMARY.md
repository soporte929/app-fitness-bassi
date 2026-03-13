# Phase 44 - Plan 2 Summary (Gap Closure)
**Status**: ✅ Complete

## Overview
El modal `ExercisePicker` aparecía cortado en dispositivos móviles porque su altura base `max-h-[85vh]` escondía el header en resoluciones pequeñas o cuando aparecía algún extra (como la barra de navegación del safari móvil). Se redujo esta altura a `max-h-[75dvh]` en responsive bajo móvil para asegurar que el header y el botón de cerrar estén siempre accesibles.

## Tasks Completed
1. **Reducir max-height en móviles**:
   - Componente modificado: `components/trainer/exercise-picker.tsx`
   - Se ajustó la altura de mobile a `75dvh`, asegurando que `dvh` respete la altura extra que pueden tomar UI propias de SO en móvil.
   - En desktop/tablet (a partir del breakpoint `min-[431px]:`) se conserva la altura de `85vh` para más comodidad de vista de lista.
2. **Actualizar Roadmap y Planificación**:
   - Creado documento de planning `44-02-PLAN.md` como "gap closure".
   - ROADMAP actualizado para reflejar este nuevo plan bajo Phase 44.

## Next Steps
- Validación manual (QA) de que el component fluye bien en un iPhone real o simulador a 390px, comprobando que el título "Añadir ejercicio" queda visible incluso en modos landscape/portrait distintos si fuera posible abrirlo en varios ángulos de visor.
