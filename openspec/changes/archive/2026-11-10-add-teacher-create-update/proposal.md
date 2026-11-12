# Proposal

## Why

La feature de profesores sólo muestra el listado. El cliente 3.0.0 ya expone `TeachersApiFp.createTeacher` y `updateTeacher`, así que el front puede dar de alta y editar profesores igual que hace con cursos, sin esperar a más cambios en el back.

El encargo es que la implementación siga la misma estructura que `courses-crud-feature`: mismas carpetas por capas, mismos patrones (formulario en panel lateral, hooks de mutación con invalidación de caché, casos de uso sobre el cliente generado) y el mismo comportamiento al guardar que ya se corrigió en cursos.

## What Changes

- **Alta de profesor**: botón "Nuevo profesor" en la cabecera. Abre un panel lateral con el formulario (nombre, apellidos, email). Al guardar llama a `POST /resources/teachers` (`createTeacher`).
- **Edición de profesor**: botón "Editar profesor" en una nueva columna de acciones del listado. Abre el mismo panel con los datos de la fila. Al guardar llama a `PATCH /resources/teachers/{id}` (`updateTeacher`) con los tres campos.
- **Validación**: nombre, apellidos y email obligatorios; el email debe tener formato válido.
- **Comportamiento al guardar** (igual que cursos tras `fix-course-baseline-bugs`): el panel permanece abierto hasta recibir la respuesta; si la operación falla, se muestra un mensaje de error y el formulario conserva los datos; si tiene éxito, el panel se cierra y se invalida la caché de `teachers`.
- **Columnas**: el listado añade la columna "Acciones" con el botón de editar. El estado del profesor se muestra como hoy.

Fuera de alcance:
- Eliminar profesores (la interfaz de cursos tiene un botón sin efecto; no se replica).
- Cambiar el estado (activar o desactivar). La API tiene endpoints propios (`deactivateTeacher`, `reactivateTeacher`), pero el patch de edición no incluye estado, así que se dejan para un cambio aparte.
- Gestión de habilitaciones y asignaturas del profesor.
- Edición del propio perfil (`updateMyTeacherProfile`).

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `oferta-academica-profesores`: se añaden los requisitos de alta, edición, validación y error al guardar; y se modifica "Columnas del listado de profesores" para incluir la columna de acciones.

## Impact

- **Código** (`libs/academic-offer/teacher-crud-feature/src/lib`), con la misma estructura que cursos:
  - `domain/entities/teacher.ts` (tipos de alta y edición).
  - `application/use-cases/create-teacher.ts` y `update-teacher.ts`.
  - `presentation/hooks/data-access/useCreateTeacher.ts` y `useUpdateTeacher.ts`.
  - `presentation/components/NewEditTeacherForm.tsx`, y cambios en `TeachersHeader.tsx` y `TeachersTable.tsx`.
  - `presentation/constants/teacher-columns.tsx` (columna de acciones).
  - `presentation/pages/teachers-page.tsx` (panel lateral y estado de edición).
- **API**: `createTeacher` y `updateTeacher` del cliente 3.0.0; sin cambios de versión.
- **Tests**: casos de uso, hooks, formulario, columnas, cabecera y página, siguiendo los de cursos.
- **Spec**: el Purpose de `oferta-academica-profesores` dice "no incluye alta, edición ni baja". Tras archivar, hay que actualizarlo a mano, porque el sync no reescribe el Purpose de una capacidad existente.
