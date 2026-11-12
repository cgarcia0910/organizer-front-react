# Tasks

## 1. Cliente 4.0.0

- [x] 1.1 Confirmar que `package.json` tiene `@cgarcia0910/api-academiccatalog` en `^4.0.0` y que `package-lock.json` lo resuelve a `4.0.0`; verificar con `node -p "require('@cgarcia0910/api-academiccatalog/package.json').version"` que devuelve `4.0.0` y con `git diff --stat -- package.json package-lock.json` que sólo cambia esa dependencia
- [x] 1.2 Ejecutar `npx tsc` sobre `teacher-crud-feature` y `courses-crud-feature`; anotar los errores que ya existían antes de la subida a 4.0.0 y corregir sólo los que aparezcan por la 4.0.0. Verificado: sin errores nuevos en `courses-crud-feature`; `teacher-crud-feature` tiene un error previo en `NewEditTeacherForm` (`Stack` con `justifyContent`)

## 2. Dominio, lectura y casos de uso de guardado

- [x] 2.1 Mantener `domain/entities/habilitation.ts` con el tipo de habilitación, la fila `HabilitationRow` y el tipo de alta `{ courseId, subjectId }`; verificar con `tsc` que compila
- [x] 2.2 Mantener `get-teacher-habilitations.ts` con `page=0` y `size=50`; verificar con un test que la llamada usa exactamente esos valores y devuelve `items`
- [x] 2.3 Crear `PartialSaveError` en `application/errors.ts` con el `teacherId` del profesor ya guardado y el mensaje de la causa; verificar con un test que lleva el id y el mensaje
- [x] 2.4 Cambiar `application/use-cases/create-teacher.ts` para que reciba `{ firstName, lastName, email, habilitations }`, llame a `POST /teachers` con sólo los tres campos y, si hay filas, a `createHabilitations` con el id devuelto; si ese segundo paso falla, lanza `PartialSaveError` con el id. Verificar con tests: sin filas no llama a habilitaciones; con filas llama una vez con la lista; si falla el segundo paso lanza `PartialSaveError` con el id; si falla el primero no llama a habilitaciones
- [x] 2.5 Cambiar `application/use-cases/update-teacher.ts` para que reciba `{ id, firstName, lastName, email, habilitations }`, haga `PATCH` primero y, si hay filas nuevas, `createHabilitations` con sólo esas filas. Verificar con tests: el id va en la ruta y no en el cuerpo; sin filas no llama a habilitaciones; si falla el `PATCH` no llama a habilitaciones; si falla el `POST` lanza `PartialSaveError` con el id del profesor
- [x] 2.6 Exportar `getCourseSubjects` desde `libs/academic-offer/courses-crud-feature` (ya hecho) y comprobar `npx nx lint teacher-crud-feature` sin errores de límites; verificar con el test de `get-course-subjects` que sigue pasando

## 3. Hooks de datos

- [x] 3.1 Cambiar `useCreateTeacher` y `useUpdateTeacher` para que invaliden `['teachers']` siempre y `['teacher-habilitations', id]` cuando hubo filas o hubo `PartialSaveError`; verificar con tests de ambos casos
- [x] 3.2 Mantener `useTeacherHabilitations` con la clave `['teacher-habilitations', teacherId]` y `enabled` sin id; verificar con test
- [x] 3.3 Mantener `useCourseOptions` y `useCourseSubjects`; verificar con tests

## 4. Formulario de profesor

- [x] 4.1 En `NewEditTeacherForm.tsx`, añadir `habilitations` al esquema con `useFieldArray`, opcional, y la validación de fila incompleta y de fila repetida; verificar con tests de añadir y quitar filas y de cada error
- [x] 4.2 Añadir la sección "Habilitaciones" al formulario: en edición, la tabla de existentes de sólo lectura (usando `TeacherHabilitationsTable`) y después las filas nuevas; en alta, sólo las filas nuevas. Verificar con tests de ambos modos
- [x] 4.3 Filtrar del selector de asignatura las que ya tienen habilitación `ACTIVE` para ese curso; verificar con test
- [x] 4.4 Guardar: en alta llamar a `createTeacher`; en edición a `updateTeacher`; tras `PartialSaveError` guardar el id, pasar a modo edición y mostrar el mensaje de que el profesor se creó pero no sus habilitaciones; verificar con tests de éxito, fallo previo a crear, fallo tras crear y reintento que hace `PATCH`
- [x] 4.5 Ampliar el ancho máximo del formulario para que quepan las tablas; verificar visualmente en el paso 6.3

## 5. Listado de profesores

- [x] 5.1 Quitar la acción "Habilitaciones" de `presentation/constants/teacher-columns.tsx` y el callback `onHabilitations` de `TeachersTable.tsx`; verificar con `teacher-columns.spec.tsx` que la columna sólo tiene "Editar profesor"
- [x] 5.2 Quitar de `teachers-page.tsx` el segundo `Drawer` y el estado de habilitaciones; eliminar `TeacherHabilitationsPanel.tsx`, su spec y `teachers-page.habilitations.spec.tsx`; verificar con `teachers-page.spec.tsx` y `teachers-page.crud.spec.tsx` que siguen pasando

## 6. Verificación final

- [x] 6.1 Ejecutar `npx nx test teacher-crud-feature` y `npx nx test courses-crud-feature`; verificar que pasan
- [x] 6.2 Ejecutar `npx nx lint teacher-crud-feature` y `npx nx build react-front`; verificar que pasan y `npx nx sync:check` sin avisos
- [x] 6.3 Revisión manual en `npx nx serve react-front` contra un back con `HabilitationsApi` de 4.0.0: alta con dos filas en una petición `POST`, edición que muestra las existentes en tabla y añade filas, y un fallo simulado tras crear el profesor que deja el formulario en modo edición

## Workflow follow-up

- Edición y revocación de habilitaciones: pendientes, en otra tarea cuando el back exponga el endpoint de actualización. La revocación la retira el cliente 4.0.0 en su siguiente versión.
- Confirmar con el equipo de back que `HabilitationsApi` de 4.0.0 está desplegado y que `POST /teachers/{teacherId}/habilitations` rechaza duplicados (o no); ajustar el mensaje de error si devuelve un código concreto.
- Corregir en `openspec/specs/oferta-academica-profesores/spec.md` el Purpose ("no incluye alta, edición ni baja") al archivar; el sync no lo reescribe.
- Archivar el cambio con `/opsx:archive` cuando se cierre la revisión manual.
