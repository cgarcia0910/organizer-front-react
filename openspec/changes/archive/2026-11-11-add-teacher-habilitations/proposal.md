# Proposal

## Why

Un profesor sólo puede impartir clase en las asignaturas de los cursos para los que está habilitado. El front no permite consultar ni dar de alta esas habilitaciones. El cliente `@cgarcia0910/api-academiccatalog` 4.0.0 ya expone `HabilitationsApi` (listar y crear en lote).

Igual que las asignaturas se gestionan dentro del formulario de curso, las habilitaciones deben gestionarse dentro del formulario de profesor, en alta y en edición.

La actualización a 4.0.0 ya está en el árbol de trabajo (`package.json` y `package-lock.json`, sin commitear). Este cambio la da por hecha y la verifica en las tareas.

## What Changes

- **Sección "Habilitaciones" en el formulario de profesor**, en alta y en edición, debajo de los datos del profesor.
- **Habilitaciones existentes** (sólo en edición): tabla de sólo lectura con Curso, Asignatura, Estado y Efectiva, leída de `GET /resources/teachers/{teacherId}/habilitations` (`page=0`, `size=50`, sin paginación).
- **Nuevas habilitaciones**: filas dinámicas, como las asignaturas de un curso. Cada fila elige curso y asignatura; se pueden añadir y quitar. Las asignaturas ya habilitadas no se ofrecen de nuevo. Las filas son opcionales.
- **Alta**: crea el profesor (`POST /resources/teachers`) y después, si hay filas, una única llamada `POST /resources/teachers/{id}/habilitations`.
- **Edición**: `PATCH /resources/teachers/{id}` y después, si hay filas nuevas, un `POST` de habilitaciones sólo con esas filas.
- **Orden de llamadas**: el profesor va primero. Si el `POST` de habilitaciones falla, reintentar repite el `PATCH` (idempotente) y el `POST`; no crea un segundo profesor ni duplica habilitaciones que no llegaron a crearse.
- **Sin edición ni revocación** de habilitaciones existentes: no hay endpoint de actualización en el back. La revocación la retira el cliente 4.0.0 en su siguiente versión.
- **Sin acción "Habilitaciones" en el listado**: el panel separado de la versión anterior se elimina.

Decisiones tomadas sin consultar (fáciles de cambiar):
- Las habilitaciones son opcionales en el formulario, a diferencia de lo que hace el curso con sus asignaturas.
- El orden de llamadas (profesor primero) difiere del de cursos (asignaturas primero) para evitar duplicados al reintentar.

Fuera de alcance:
- Editar o revocar habilitaciones existentes (pendiente del back).
- Paginación del listado de habilitaciones.
- Activar o desactivar profesores (sigue fuera, como en `add-teacher-create-update`).
- Consultar habilitaciones desde el listado de cursos o de asignaturas.

## Capabilities

### New Capabilities

- `oferta-academica-habilitaciones`: habilitaciones de un profesor (curso y asignatura para los que está habilitado), vistas y dadas de alta desde el formulario de profesor, con el estado de efectividad que devuelve la API.

### Modified Capabilities

Ninguna. El formulario de profesor y su listado no cambian sus requisitos existentes; la sección nueva se especifica en la capacidad de habilitaciones. La frase del Purpose de `oferta-academica-profesores` ("no incluye alta, edición ni baja") sigue desactualizada desde `add-teacher-create-update` y se corrige al archivar.

## Impact

- **Dependencias**: `@cgarcia0910/api-academiccatalog` `^4.0.0` (ya en el árbol de trabajo).
- **Código**: `libs/academic-offer/teacher-crud-feature/src/lib`:
  - `domain/entities/habilitation.ts` (tipos de habilitación y de alta).
  - `application/use-cases/`: `create-teacher.ts` y `update-teacher.ts` pasan a crear las habilitaciones después del profesor; `get-teacher-habilitations.ts` y `get-course-options.ts` para lectura.
  - `presentation/hooks/data-access/`: consultas de habilitaciones y de cursos; la invalidación de `['teacher-habilitations', id]` tras guardar.
  - `presentation/components/NewEditTeacherForm.tsx`: sección de habilitaciones.
  - `presentation/components/` para la tabla de existentes y las filas nuevas.
  - `presentation/constants/`: columnas de habilitaciones; se quita la acción "Habilitaciones" de `teacher-columns.tsx`.
  - Se eliminan `TeacherHabilitationsPanel.tsx` y `teachers-page.tsx` vuelve a su versión sin el segundo `Drawer`.
- **Lectura de cursos y asignaturas**: `getCourseSubjects` de `courses-crud-feature`, exportado desde su índice.
- **API**: `HabilitationsApi` de 4.0.0 (`listTeacherHabilitations`, `createHabilitations`).
- **Tests**: casos de uso, hooks, formulario (sección y guardado en alta y edición), columnas y página.
