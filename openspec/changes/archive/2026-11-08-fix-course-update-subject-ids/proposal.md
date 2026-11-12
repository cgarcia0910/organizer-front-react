# Proposal

## Why

Al editar un curso, el front envía las asignaturas sin su `id`, así que el back no puede distinguir una asignatura existente de una nueva. Cualquier edición duplica o pierde asignaturas en lugar de modificarlas. Esto es una corrección sobre `fix-course-baseline-bugs`, que dejó el envío de asignaturas sin `id` y sin revisar el contrato.

El contrato que se adopta: el front manda la lista completa de asignaturas del curso, cada una con su `id` si ya existía y sin `id` si es nueva. El back decide si crea, edita o borra. Hoy la llamada es un PATCH en lote; se prevé pasar a PUT, así que el envío debe tratarse como reemplazo completo desde ya.

## What Changes

- Cada asignatura que ya existe se envía con su `id`. Las nuevas se envían sin `id`.
- La lista enviada en la edición contiene todas las asignaturas del curso, no sólo la primera página ni sólo las activas. Las asignaturas que el usuario quita del formulario dejan de aparecer en la lista.
- El `id` llega al caso de uso `updateCourse` sin que el esquema de validación del formulario lo elimine.
- Se conserva `updateSubjects` (PATCH en lote) como llamada actual; el cambio a PUT queda fuera de este cambio.
- **BREAKING** para el back: la lista enviada en `updateCourse` es la fuente de verdad del conjunto de asignaturas. Una asignatura omitida se interpreta como borrada.

Fuera de alcance:
- Crear un endpoint PUT o cambiar el método HTTP (se hará cuando el back lo exponga).
- Desactivar o reactivar asignaturas desde la interfaz.
- Cambiar el envío de `updateCourse` a `CoursePatch` (ver `fix-course-baseline-bugs/design.md`, Open Questions).

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `oferta-academica-cursos`: cambian los requisitos de carga de asignaturas para editar y de guardado de cambios. El cambio asume que `fix-course-baseline-bugs` se archiva antes, porque sus deltas sobre el mismo requisito se aplican en orden.

## Impact

- **Código**:
  - `libs/academic-offer/courses-crud-feature/src/lib/presentation/pages/courses-page.tsx` (carga de todas las asignaturas para editar).
  - `libs/academic-offer/courses-crud-feature/src/lib/application/use-cases/get-course-subjects.ts` (paginación completa o parámetros de inactivos).
  - `libs/academic-offer/courses-crud-feature/src/lib/application/use-cases/update-course.ts` (envío del `id`).
  - `libs/academic-offer/courses-crud-feature/src/lib/presentation/components/NewEditCourseForm.tsx` y su `courseSchema` (conservar `id` en validación).
- **API**: el cliente generado `@cgarcia0910/api-academiccatalog` 2.0.0 tipa `SubjectPatch` sin `id`. Se resuelve en `design.md`.
- **Back**: debe interpretar la lista como conjunto completo y decidir crear, editar o borrar por presencia y `id`. Requiere confirmación del equipo de back.
