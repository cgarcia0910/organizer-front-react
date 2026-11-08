# Tasks

## 1. Dependencia del cliente

- [x] 1.1 Cambiar `@cgarcia0910/api-academiccatalog` a `^3.0.0` en `package.json` y ejecutar `npm install`; verificar con `node -p "require('@cgarcia0910/api-academiccatalog/package.json').version"` que devuelve `3.0.0` y con `git diff --stat -- package.json package-lock.json` que sólo cambia esa dependencia
- [x] 1.2 Ejecutar `npx tsc -p libs/academic-offer/courses-crud-feature/tsconfig.lib.json --noEmit` y verificar que el único error nuevo respecto a antes de la subida está en `update-course.ts`, por la nueva firma de `updateSubjects` (se corrige en el grupo 2); los errores previos de `CoursesFilters`, `CoursesHeader`, `CoursesSummary`, `CoursesTable`, `course-columns`, `courses-page` y el `append` del formulario ya existían

## 2. Cálculo de cambios y envío

- [x] 2.1 Añadir `UpdateCourseCommand = UpdateCourse & { originalSubjects: SubjectWithId[] }` en `domain/entities/courses.ts`; verificar con `tsc` que compila sin errores nuevos en ese archivo
- [x] 2.2 En `update-course.ts`, implementar `buildSubjectChanges(original, current)` según design.md y usarlo en `updateCourse`: enviar el cuerpo `{ new, update, delete }` sólo con los grupos con contenido y omitir `updateSubjects` si no hay cambios; verificar con tests de `buildSubjectChanges` que cubren sin cambios (`{}`), sólo nuevas, sólo modificadas (con `id` y los cuatro campos), sólo eliminadas, la combinación de las tres y una asignatura con `id` desconocido, que se ignora
- [x] 2.3 Reescribir `update-course.spec.ts` para `updateCourse`: verificar que llama a `updateSubjects` con el cuerpo esperado y después al curso, que no llama a `updateSubjects` cuando no hay cambios, que propaga el error si falla `updateSubjects` y que `originalSubjects` no viaja en el cuerpo del curso

## 3. Formulario de edición

- [x] 3.1 En `NewEditCourseForm.tsx`, tipar el prop `course` como `UpdateCourse` y pasar `originalSubjects: course.subjects` en la llamada de edición a `mutateAsync`; verificar con un test que `mutateAsync` recibe `originalSubjects` igual a la lista cargada y `subjects` igual a la lista editada
- [x] 3.2 Verificar con tests del formulario que, al modificar una asignatura existente, `subjects` lleva su `id` con el valor nuevo mientras `originalSubjects` conserva el valor anterior; que al añadir una asignatura llega sin `id`; y que al quitar una existente ya no aparece en `subjects` pero sigue en `originalSubjects`

## 4. Verificación final

- [x] 4.1 Ejecutar `npx nx test courses-crud-feature`, `npx nx lint courses-crud-feature` y `npx nx build react-front` y verificar que pasan sin errores nuevos
- [x] 4.2 Revisar en `npx nx serve react-front`, contra un back con el contrato 3.0.0, la edición de un curso que añade, modifica y quita asignaturas en un mismo guardado: verificar en la pestaña de red que `PATCH /resources/courses/{id}/subjects` lleva `new`, `update` y `delete`, y que un guardado sin cambios en asignaturas no lanza esa petición

## Workflow follow-up

- Confirmar con el equipo de back que `PATCH /resources/courses/{id}/subjects` ya expone el contrato 3.0.0 antes de desplegar; ambos contratos son incompatibles entre sí.
- Si el back no acepta los cuatro campos en `update`, ajustar `buildSubjectChanges` para enviar sólo los campos modificados.
- Archivar el cambio con `/opsx:archive` cuando se cierre la revisión manual.
