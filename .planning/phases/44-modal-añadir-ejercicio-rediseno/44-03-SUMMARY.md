# Phase 44 - Plan 3 Summary (Gap Closure)
**Status**: ✅ Complete

## Overview
El modal `ExercisePicker` había sido corregido para móviles (75dvh), pero seguía apareciendo cortado en desktop debido al límite de máxima altura predefinido para dicho breakpoint (`max-h-[85vh]`). Esto ocasionaba que el título del modal ("Añadir ejercicio") y el botón de cierre (X) fuesen ocultados parcialmente en la zona superior de pantallas en PC o tableta.

## Tasks Completed
1. **Unificar max-height**:
   - Componente modificado: `components/trainer/exercise-picker.tsx`.
   - Se removió la clase `min-[431px]:max-h-[85vh]`, aplicando en su lugar `max-h-[75dvh]` en todos los breakpoints, garantizando que el diseño escale a un tamaño visible y centrado.
   - Ya se contaba con la clase `flex-shrink-0` en los encabezados, la barra de búsqueda y en los filtros de grupos musculares, por lo tanto, esto garantizó inmediatamente que el espacio se repartiera correctamente en favor de preservar la caja visible antes que la lista.
2. **Actualizar documentos**:
   - Agregados los archivos `.planning/phases/44-modal-añadir-ejercicio-rediseno/44-03-PLAN.md` y `.planning/phases/44-modal-añadir-ejercicio-rediseno/44-03-SUMMARY.md` para documentar la intervención puntual.

## Next Steps
- En caso de reabrir Phase 44, se procedería ya de forma independiente; la reingeniería del diseño para ambos breakpoints (desktop/mobile) se asienta.
