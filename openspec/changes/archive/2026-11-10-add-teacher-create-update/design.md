# Design

## Context

Estado verificado:

- `courses-crud-feature` es la referencia: `domain/entities`, `application/use-cases` (`create-course.ts`, `update-course.ts`), `presentation/hooks/data-access` (`useCreateCourse`, `useUpdateCourse`, que invalidan `['courses']`), `presentation/components/NewEditCourseForm.tsx` (un solo formulario para alta y edición, en un `Drawer` de la página), `CoursesHeader` con el botón "Nuevo curso", y `course-columns.tsx` con la columna de acciones.
- `teacher-crud-feature` tiene hoy el listado: `TeachersPage`, `TeachersHeader` (sin props), `TeachersTable`, `teacher-columns.tsx` (sin acciones) y `useTeachers`.
- El cliente 3.0.0 expone `createTeacher(TeacherCreate)` con `{ firstName, lastName, email }`, y `updateTeacher(teacherId, TeacherPatch)` con los mismos tres campos opcionales. No hay estado en la edición: `activate`/`deactivate` son endpoints aparte.
- Los formularios de cursos usan `react-hook-form` con `zodResolver`. Las dependencias ya están en el workspace.

Ver proposal.md para el motivo y el alcance.

## Goals / Non-Goals

**Goals:**
- Replicar en profesores la estructura y los patrones de cursos para alta y edición.
- Aplicar desde el principio el comportamiento correcto al guardar: el panel espera la respuesta, muestra el error y conserva los datos.
- Mantener un solo formulario para alta y edición, como en cursos.

**Non-Goals:**
- Eliminar profesores y cambiar estado (activar o desactivar).
- Gestión de habilitaciones, asignaturas o perfil propio.

## Decisions

### 1. Estructura espejo de cursos

| Carpeta | Nuevo o cambio |
|---|---|
| `domain/entities/teacher.ts` | Añade `CreateTeacher = Omit<Teacher, 'id' \| 'status' \| 'createdAt' \| 'updatedAt'>` y `UpdateTeacher = Pick<Teacher, 'id' \| 'firstName' \| 'lastName' \| 'email'>`. |
| `application/use-cases/create-teacher.ts` | Nuevo. Llama a `TeachersApiFp.createTeacher` con los tres campos. |
| `application/use-cases/update-teacher.ts` | Nuevo. Llama a `updateTeacher(id, { firstName, lastName, email })`; el `id` va en la ruta, no en el cuerpo. |
| `presentation/hooks/data-access/useCreateTeacher.ts` y `useUpdateTeacher.ts` | Nuevos. `useMutation` que invalida `['teachers']` al tener éxito. |
| `presentation/components/NewEditTeacherForm.tsx` | Nuevo. Formulario único para alta y edición, con `teacherSchema` (zod). |
| `presentation/components/TeachersHeader.tsx` | Cambia: recibe `onCreate` y muestra el botón "Nuevo profesor". |
| `presentation/components/TeachersTable.tsx` | Cambia: recibe `onEdit` y lo pasa a las columnas. |
| `presentation/constants/teacher-columns.tsx` | Cambia: `getTeacherColumns({ onEdit })` añade la columna "Acciones" con el botón de editar. |
| `presentation/pages/teachers-page.tsx` | Cambia: estado del panel (`open`, `editingTeacher`), `onCreate`, `onEdit` y el `Drawer` con el formulario. |

### 2. Edición sin petición extra

La fila del listado ya trae `id`, `firstName`, `lastName` y `email`. Al editar se abre el formulario con esa fila; no hace falta `getTeacher`. Si el back devolviera datos más antiguos, el guardado los sobrescribe igualmente.

*Alternativa considerada*: pedir `getTeacher(id)` antes de abrir el formulario, como cursos hace con sus asignaturas. Se descarta: los profesores no tienen datos hijos que cargar.

### 3. Patch con los tres campos

`updateTeacher` recibe siempre `firstName`, `lastName` y `email`, aunque no hayan cambiado. Así el cuerpo no depende de qué campos toca el usuario y el caso de uso es trivial. El coste es enviar campos sin cambios, que el back acepta como parche.

*Alternativa considerada*: enviar sólo los campos modificados, como hace el cálculo de asignaturas. Se descarta: un profesor tiene tres campos, y la comparación no aporta nada.

### 4. Guardado con espera y error

El formulario usa `mutateAsync` dentro de `try/catch` desde el principio: el panel se cierra sólo tras éxito, y un fallo muestra un `Alert` con `saveError` y conserva los datos. Es el patrón que cursos necesitó corregir en `fix-course-baseline-bugs`.

### 5. Validación

`teacherSchema` (zod) aplica `trim()` y `min(1)` a nombre, apellidos y email, y `email()` al email. Los mensajes van en castellano, como el resto de la sección de profesores. Los espacios se quitan antes de validar.

*Riesgo*: la validación de formato de email del front puede ser más laxa o más estricta que la del back. Un email que el front acepta y el back rechaza muestra el error de guardado, sin pérdida de datos.

## Risks / Trade-offs

- **[Email duplicado]** El back puede rechazar un email ya usado. → El error se muestra con el mensaje genérico de guardado; no hay validación de unicidad en el front.
- **[Edición de inactivos]** Se puede editar un profesor inactivo. El estado no se toca. → Coherente con la API, que no liga la edición al estado.
- **[Cabecera con props]** `TeachersHeader` pasa de no tener props a recibir `onCreate`. → Sus tests se actualizan.
- **[Columna de acciones sin eliminar]** La columna sólo tiene editar, a diferencia de cursos, que tiene un botón de eliminar sin efecto. → Decisión para no replicar código muerto.

## Migration Plan

Sin migración de datos. Se añaden mutaciones sobre endpoints que ya existen en el cliente 3.0.0. Rollback: revertir los cambios; el listado sigue funcionando sin ellos.

## Open Questions

Ninguna que bloquee el plan. Dos supuestos quedan registrados:
- La edición envía siempre los tres campos (decisión 3).
- No hay botón de eliminar ni de cambiar estado en este cambio.
