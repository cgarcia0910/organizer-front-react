# Tasks

## 1. Dominio y casos de uso

- [x] 1.1 En `domain/entities/teacher.ts`, añadir `CreateTeacher` y `UpdateTeacher` según design.md; verificar con `tsc -p tsconfig.lib.json --noEmit` que no aparecen errores nuevos en ese archivo
- [x] 1.2 Crear `application/use-cases/create-teacher.ts` que llama a `TeachersApiFp.createTeacher` con `firstName`, `lastName` y `email`; verificar con un test que mockea el cliente y comprueba el cuerpo enviado, sin `id`
- [x] 1.3 Crear `application/use-cases/update-teacher.ts` que llama a `updateTeacher(id, { firstName, lastName, email })`; verificar con un test que el `id` va en la ruta y no en el cuerpo, y que el cuerpo siempre tiene los tres campos

## 2. Hooks de mutación

- [x] 2.1 Crear `presentation/hooks/data-access/useCreateTeacher.ts` y `useUpdateTeacher.ts` con `useMutation` que invalidan `['teachers']` al tener éxito; verificar con un test que tras un éxito se invalida la caché de `teachers` y tras un fallo no

## 3. Formulario de alta y edición

- [x] 3.1 Crear `presentation/components/NewEditTeacherForm.tsx` con `teacherSchema` (zod: `trim` y `min(1)` en nombre, apellidos y email, `email()` en email), en modo alta si no hay `teacher` y en modo edición si lo hay; verificar con tests que los campos vacíos y un email inválido muestran errores y no llaman a la API
- [x] 3.2 En el formulario, usar `mutateAsync` dentro de `try/catch`: cerrar sólo tras éxito, mostrar un `Alert` con el mensaje de fallo y conservar los datos; verificar con tests que el panel no se cierra tras un fallo y que los datos siguen en los campos
- [x] 3.3 Deshabilitar el botón "Guardar profesor" mientras se guarda; verificar con un test que el botón está deshabilitado durante una petición pendiente
- [x] 3.4 En modo edición, verificar con un test que `mutateAsync` recibe el `id` de la fila y los tres campos, y que los campos muestran los datos de la fila al abrir

## 4. Listado: acciones y cabecera

- [x] 4.1 En `teacher-columns.tsx`, cambiar la firma a `getTeacherColumns({ onEdit })` y añadir la columna "Acciones" con un botón "Editar profesor" y sin botón de eliminar; verificar con un test que el botón llama a `onEdit` con la fila
- [x] 4.2 Actualizar `teacher-columns.spec.tsx` a la nueva firma y cubrir la columna de acciones; verificar que pasa
- [x] 4.3 En `TeachersHeader.tsx`, recibir `onCreate` y mostrar el botón "Nuevo profesor"; verificar con un test que el botón llama a `onCreate`
- [x] 4.4 En `TeachersTable.tsx`, recibir `onEdit` y pasarlo a `getTeacherColumns`; verificar con el test de la página que las filas tienen el botón de editar

## 5. Página: panel lateral

- [x] 5.1 En `teachers-page.tsx`, añadir el estado del panel (`open`, `editingTeacher`), `onCreate` (sin profesor) y `onEdit` (con la fila), y el `Drawer` con `NewEditTeacherForm`; verificar con tests que "Nuevo profesor" abre el formulario vacío y "Editar profesor" lo abre con los datos de la fila
- [x] 5.2 Verificar con un test que tras guardar con éxito el panel se cierra y que el listado se consulta de nuevo

## 6. Exportación y verificación final

- [x] 6.1 Ejecutar `npx nx test teacher-crud-feature`, `npx nx lint teacher-crud-feature` y `npx nx build react-front` y verificar que pasan sin errores nuevos
- [ ] 6.2 Revisar en `npx nx serve react-front`, contra un back con el contrato 3.0.0: dar de alta un profesor, editar uno existente, probar un email inválido y simular un fallo de red al guardar; verificar que cada caso se comporta como en `specs/oferta-academica-profesores/spec.md`

## Workflow follow-up

- Actualizar a mano el Purpose de `openspec/specs/oferta-academica-profesores/spec.md` tras archivar: dice que no incluye alta, edición ni baja, y el sync no lo reescribe.
- Eliminar profesores y cambiar estado quedan para cambios aparte.
