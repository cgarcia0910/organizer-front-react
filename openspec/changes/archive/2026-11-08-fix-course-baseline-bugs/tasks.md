# Tasks

## 1. Listado: estado y columnas

- [x] 1.1 En `course-columns.tsx`, eliminar las columnas `modality` y `duration`; verificar con `npx nx lint courses-crud-feature` que no quedan referencias a esos campos
- [x] 1.2 Sustituir el mapeo de estado por `ACTIVE → "Activo"` (`success`) e `INACTIVE → "Inactivo"` (`default`), con valor crudo y color por defecto para valores desconocidos; verificar con un test de `getCourseColumns` que el chip de `ACTIVE` muestra "Activo" y el de `INACTIVE` muestra "Inactivo"

## 2. Código de asignatura

- [x] 2.1 En `create-course.ts`, enviar `course.subjects` a `createSubject` sin reasignar `code`; verificar con un test que la llamada recibe el `code` introducido por el usuario
- [x] 2.2 En `update-course.ts`, enviar `course.subjects` a `updateSubjects` sin reasignar `code`; verificar con un test que la llamada recibe el `code` introducido por el usuario

## 3. Guardado con retroalimentación de error

- [x] 3.1 En `NewEditCourseForm.tsx`, cambiar `onSubmit` para usar `mutateAsync` dentro de `try/catch`, llamando a `onClose()` solo tras éxito; verificar con un test que el panel no se cierra cuando la mutación rechaza
- [x] 3.2 Mostrar un `Alert` de error dentro del formulario con el mensaje del fallo y un estado local `saveError`; deshabilitar el botón "Guardar curso" mientras `isSubmitting`; verificar con un test que el `Alert` aparece tras un fallo y que los datos del formulario se conservan
- [x] 3.3 Repetir el comportamiento de 3.1 y 3.2 para la edición (rama `course` del mismo `onSubmit`); verificar con un test que un fallo en `updateCourse` muestra el `Alert` y no cierra el panel

## 4. Carga de asignaturas para editar

- [x] 4.1 En `courses-page.tsx`, envolver `getCourseSubjects` en `onEdit` con `try/catch`; si falla, no abrir el panel y mostrar un `Snackbar` con `Alert` de error; verificar con un test que el panel no se abre y aparece el mensaje cuando `getCourseSubjects` rechaza

## 5. Verificación final

- [x] 5.1 Ejecutar `npx nx test courses-crud-feature`, `npx nx lint courses-crud-feature` y `npx nx build react-front` y verificar que pasan sin errores nuevos
- [x] 5.2 Revisar manualmente en `npx nx serve react-front` el listado, la creación con código de asignatura distinto del nombre y un fallo simulado al guardar, y verificar que cada caso se comporta como en `specs/oferta-academica-cursos/spec.md`

## Workflow follow-up

- Archivar el cambio con `/opsx:archive` cuando el usuario confirme la revisión, para sincronizar `openspec/specs/oferta-academica-cursos/spec.md`.
- Tras archivar, quitar los sufijos *(comportamiento actual)* e *(incompleto)* de los nombres de escenario corregidos en `openspec/specs/oferta-academica-cursos/spec.md`. Se conservan en este cambio porque `openspec validate` exige que los nombres de escenario de un `MODIFIED` coincidan con los existentes.
