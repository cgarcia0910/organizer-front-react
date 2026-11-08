# Design

## Context

El módulo `libs/academic-offer/courses-crud-feature` tiene cuatro puntos de fallo documentados (ver proposal.md, *Why*). Las cuatro correcciones son locales al módulo y no cambian la API ni el cliente generado `@cgarcia0910/api-academiccatalog` 2.0.0. Verificado en `dist/api.d.ts`:

- `Course` no tiene `modality` ni `duration`; `status` es `ACTIVE | INACTIVE`.
- `SubjectCreate` y `SubjectPatch` aceptan `code`, además de `name`, `hoursPerWeek` y `maxHoursPerDay`.

El flujo actual de guardado está en `NewEditCourseForm.tsx`: `onSubmit` llama a `mutate(...)` y, en la línea siguiente, a `onClose()`. Por eso el panel se cierra antes de conocer el resultado, y el error de la mutación nunca se muestra. En `courses-page.tsx`, `onEdit` hace `await getCourseSubjects(...)` sin `try/catch`.

## Goals / Non-Goals

**Goals:**
- Corregir el listado, el envío de `code` de asignatura y la comunicación de errores en crear y editar, sin cambiar el contrato de la API.
- Mantener el patrón actual: TanStack Query para mutaciones, casos de uso en `application/use-cases`.

**Non-Goals:**
- Filtro de estado, ordenación del servidor, eliminación de cursos (cambios separados).
- Refactor de `updateCourse` para enviar solo campos de `CoursePatch` (ver Risks).
- Reescribir el formulario ni cambiar su validación zod.

## Decisions

### 1. Estado y columnas del listado

Se elimina `modality` y `duration` de `course-columns.tsx`, en lugar de mapearlas a otros campos. La API no tiene datos equivalentes, así que cualquier mapeo sería inventado.

El chip de estado usa un mapa explícito `ACTIVE → "Activo"` (`success`), `INACTIVE → "Inactivo"` (`default`). Un valor desconocido muestra el valor crudo con color por defecto. Se descarta "Borrador" porque la API no lo tiene.

*Alternativa considerada*: mantener las columnas con etiquetas vacías. Se descarta porque deja columnas que parecen funcionales y no lo son.

### 2. Código de asignatura

`create-course.ts` pasa `course.subjects` tal cual a `createSubject`, sin reasignar `code`. `update-course.ts` hace lo mismo en `updateSubjects`. El formulario ya valida que `code` no esté vacío, así que no hace falta un valor de respaldo.

*Alternativa considerada*: mantener `code = name` como respaldo si el usuario no escribe código. Se descarta porque la validación ya exige el código.

### 3. Guardado con retroalimentación

`onSubmit` pasa a ser `async` y usa `mutateAsync` dentro de `try/catch`. Si tiene éxito, llama a `onClose()`. Si falla, no cierra el panel y muestra un `Alert` de error con el mensaje, usando un estado local `saveError`. Los datos del formulario no se pierden porque el `useForm` sigue montado.

El botón "Guardar curso" se deshabilita mientras `isSubmitting` sea verdadero, para evitar dobles envíos.

*Alternativa considerada*: usar `onError` del `useMutation`. Se descarta porque el hook es compartido y no tiene acceso al formulario abierto; el error debe mostrarse en el panel que lo originó.

### 4. Error al cargar asignaturas para editar

En `courses-page.tsx`, `onEdit` envuelve `getCourseSubjects` en `try/catch`. Si falla, no abre el panel y muestra un `Snackbar` con `Alert` de error en la página. Se usa `Snackbar` porque el error ocurre antes de que exista el formulario.

## Risks / Trade-offs

- **[Actualización parcial]** `updateCourse` actualiza asignaturas (`updateSubjects`) antes que el curso (`updateCourse`). Si la segunda llamada falla, las asignaturas ya cambiaron y el mensaje de error no lo indica. → Mitigación: el mensaje de error dice que el guardado no se completó; reintentar debería ser seguro, porque son PATCH sobre el mismo id, pero no se ha verificado que el backend las trate como idempotentes. Se documenta; corregirlo requiere cambiar el orden o usar una transacción en backend, fuera de alcance.
- **[Payload con campos extra]** `updateCourse` envía `course` completo (incluidos `subjects` y `status`) a `CoursePatch`, que no declara esos campos. → Mitigación: no se cambia en este cambio; la API ignora o rechaza campos según su contrato, y no se ha verificado. Ver Open Questions.
- **[Cambio visible]** Desaparecen las columnas Modalidad y Duración. → Mitigación: indicado como **BREAKING** en proposal.md; no había datos visibles.
- **[Tests]** Los tests de columnas y del formulario que asumen cierre inmediato deben actualizarse. → Se incluye en tasks.md.

## Migration Plan

No hay migración de datos. Se despliega como cualquier cambio de front-end. Rollback: revertir el commit del cambio; no hay estado persistido en el cliente que dependa de él (la sesión va por cookie y el listado se recarga desde la API).

## Open Questions

- ¿El backend acepta los campos extra de `course` en `PATCH /resources/courses/{id}` (`subjects`, `status`)? No se ha verificado contra la API real. No bloquea este cambio porque el comportamiento actual no cambia, pero conviene confirmarlo antes de tocar `updateCourse`.
