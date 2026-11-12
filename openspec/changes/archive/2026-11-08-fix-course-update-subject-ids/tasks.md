# Tasks

## 1. Carga completa de asignaturas

- [x] 1.1 En `get-course-subjects.ts`, recorrer todas las páginas de `listSubjects` con `includeInactive=true` y un `size` fijo, y devolver un array plano; verificar con un test que un curso de dos páginas devuelve todas sus asignaturas, incluidas las inactivas
- [x] 1.2 Verificar con un test que si una página intermedia falla, la función rechaza y no devuelve una lista parcial

## 2. Envío de `id` en la actualización

- [x] 2.1 Definir `SubjectWithId = Subject & { id?: string }` en el dominio y usarlo en `UpdateCourse` y en `updateCourse`; verificar con `npx nx lint courses-crud-feature` y `npx tsc -p tsconfig.lib.json --noEmit` que no aparecen errores nuevos en esos archivos
- [x] 2.2 En `update-course.ts`, pasar la lista de asignaturas con su `id` a `updateSubjects` sin eliminar el campo; verificar con un test que el cuerpo enviado contiene `id` en las asignaturas existentes y no lo contiene en las nuevas

## 3. Formulario: conservar `id` y lista completa

- [x] 3.1 En `NewEditCourseForm.tsx`, añadir `id: z.string().optional()` al objeto de asignatura de `courseSchema`; verificar con un test que una asignatura con `id` llega a `mutateAsync` con su `id`
- [x] 3.2 Verificar en el formulario que el `id` de cada asignatura existente no es sobrescrito por `useFieldArray`; si lo es, fijar `keyName` a otro nombre y verificar con el mismo test de 3.1
- [x] 3.3 Verificar con un test que una asignatura añadida en el formulario se envía sin `id`, y que una asignatura quitada no aparece en la lista enviada

## 4. Verificación final

- [x] 4.1 Ejecutar `npx nx test courses-crud-feature`, `npx nx lint courses-crud-feature` y `npx nx build react-front` y verificar que pasan
- [x] 4.2 Revisar en `npx nx serve react-front` la edición de un curso con más asignaturas de una página y con una inactiva: verificar que el formulario muestra todas y que el guardado envía la lista completa con los `id` correctos

## Workflow follow-up

- Archivar `fix-course-baseline-bugs` antes que este cambio, porque ambos modifican el requisito "Edición de curso".
- Confirmar con el equipo de back que `PATCH /resources/courses/{id}/subjects` acepta `id` por elemento y trata la lista como conjunto completo, antes de desplegar.
- Al pasar a PUT, actualizar `updateSubjects` y este requisito.
