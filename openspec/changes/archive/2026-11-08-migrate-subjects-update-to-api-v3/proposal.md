# Proposal

## Why

La versión 3.0.0 de `@cgarcia0910/api-academiccatalog` cambia el contrato de actualización de asignaturas: `updateSubjects` deja de recibir una lista y pasa a recibir un cuerpo con tres grupos explícitos (asignaturas nuevas, modificadas y eliminadas). El front actual envía la lista completa con `id` y deja que el back deduzca qué crear, editar o borrar, que era el contrato de la 2.0.0. Contra un back que ya usa la 3.0.0, la edición de cursos no funciona: el tipo del cuerpo no coincide y el back no interpreta una lista suelta.

Se hace ahora porque el back evoluciona a este contrato y mantener el front en la 2.0.0 lo deja sin poder editar las asignaturas de un curso.

## What Changes

- Subir la dependencia `@cgarcia0910/api-academiccatalog` de `^2.0.0` a `^3.0.0`.
- Al guardar un curso editado, el front compara la lista de asignaturas cargada al abrir el formulario con la lista editada, y envía tres grupos:
  - **Nuevas**: asignaturas sin `id` (`new`).
  - **Modificadas**: asignaturas con `id` cuyos campos cambiaron (`update`, con su `id` y los campos actuales).
  - **Eliminadas**: `id` de las asignaturas cargadas que el usuario quitó del formulario (`delete`).
- Si no hay ningún cambio en asignaturas, no se llama a `updateSubjects`.
- La creación de curso no cambia: `createSubject` sigue recibiendo la lista de asignaturas nuevas.
- **BREAKING**: requiere que el back exponga el contrato 3.0.0 de `PATCH /courses/{id}/subjects`. El contrato anterior (lista completa con `id`) queda sustituido.

Fuera de alcance:
- Cambiar el método HTTP a PUT.
- Cambiar el cuerpo de `updateCourse` (curso) a los campos exactos de `CoursePatch` (ver design.md, Non-Goals).
- Desactivar o reactivar asignaturas desde la interfaz.
- Eliminar el cliente `updateSubject` (singular), que desaparece en la 3.0.0: el repositorio no lo usa.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `oferta-academica-cursos`: cambia el requisito "Edición de curso". Hoy dice que el guardado envía la lista completa con `id` y que el back decide; pasa a describir el envío de asignaturas nuevas, modificadas y eliminadas.

## Impact

- **Dependencias**: `package.json` y `package-lock.json` (cliente a 3.0.0).
- **Código** (`libs/academic-offer/courses-crud-feature/src/lib`):
  - `domain/entities/courses.ts` (tipo del comando de edición con la lista original).
  - `application/use-cases/update-course.ts` (cálculo de altas, cambios y bajas y llamada a `updateSubjects` con el nuevo cuerpo).
  - `presentation/components/NewEditCourseForm.tsx` (envío de la lista original junto a la editada).
- **API**: el cliente 3.0.0 cambia la firma de `updateSubjects` (recibe `UpdateSubjectsRequest`), añade `id` opcional a `SubjectPatch` y elimina `updateSubject`. El resto de la API de cursos y asignaturas no cambia respecto a la 2.0.0.
- **Back**: debe estar en el contrato 3.0.0 antes de desplegar este cambio.
- **Tests**: los tests de `update-course` y del formulario de edición se reescriben para el nuevo cuerpo.
