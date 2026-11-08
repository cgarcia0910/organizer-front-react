# Design

## Context

Estado actual, verificado en el código y en el paquete 3.0.0 descargado y comparado con la 2.0.0 instalada:

- El front está en el cliente 2.0.0. `updateCourse` (use case) envía `course.subjects` como array a `updateSubjects`, y la spec principal describe ese contrato (lista completa con `id`, el back decide).
- En la 3.0.0, `updateSubjects(courseId, UpdateSubjectsRequest)` recibe `{ new?, update?, delete? }`: `new` es una lista de `SubjectCreate`, `update` una lista de `SubjectPatch` y `delete` una lista de ids. `SubjectPatch` gana un `id` opcional. `updateSubject` (singular) desaparece. El resto de tipos y endpoints no cambia respecto a la 2.0.0, y el repositorio no usa el singular.
- Ya está resuelto en el código actual todo lo previo a este cambio: `getCourseSubjects` carga todas las páginas, incluidas las inactivas, y devuelve asignaturas con `id`; el esquema del formulario conserva `id`. El prop `course` del formulario lleva la lista cargada en `course.subjects`, y `onSubmit` la reemplaza por la lista editada (`{ ...course, ...data }`).

Ver proposal.md para el motivo.

## Goals / Non-Goals

**Goals:**
- Enviar al back las asignaturas nuevas, modificadas y eliminadas en el cuerpo que define la 3.0.0.
- Calcular esos tres grupos en un único sitio, con una función pura y comprobable sin red.

**Non-Goals:**
- Cambiar el método HTTP a PUT.
- Cambiar el cuerpo de `updateCourse` (curso). Hoy envía el curso completo, incluidos `subjects` y `status`, a una operación cuyo tipo (`CoursePatch`) sólo declara `code`, `name` y `description`. Sigue igual; limpiarlo es un cambio aparte.
- Tocar el flujo de creación de curso.

## Decisions

### 1. El cálculo vive en el caso de uso, como función pura

`buildSubjectChanges(original, current)` devuelve un `UpdateSubjectsRequest`:
- `new`: asignaturas de `current` sin `id`, con `code`, `name`, `hoursPerWeek` y `maxHoursPerDay`.
- `update`: asignaturas de `current` con `id` presente en `original` cuyos cuatro campos difieren de la original; se envían con `id` y los cuatro campos.
- `delete`: `id` de las asignaturas de `original` que ya no están en `current`.

*Alternativas consideradas*:
- Calcular en el formulario: acopla la interfaz a la forma del cuerpo de la API.
- Usar `dirtyFields` de react-hook-form: con `useFieldArray`, quitar o añadir filas desplaza los índices y el estado "sucio" es difícil de interpretar.

### 2. El caso de uso recibe la lista original en el comando

Se añade al dominio `UpdateCourseCommand = UpdateCourse & { originalSubjects: SubjectWithId[] }`. El formulario envía `originalSubjects: course.subjects`, la lista que cargó al abrir. `updateCourse` separa `originalSubjects` del resto antes de llamar a `updateCourse` del cliente, así que el cuerpo del curso no cambia.

*Alternativa considerada*: que el caso de uso vuelva a pedir las asignaturas antes de comparar. Se descarta: añade una petición por guardado y compara contra datos distintos de los que vio el usuario.

### 3. Sólo se envían los grupos con contenido, y se omite la llamada si no hay cambios

Los grupos vacíos no se incluyen. Si los tres están vacíos, no se llama a `updateSubjects` y sólo se actualiza el curso. Así un guardado que sólo cambia el nombre del curso no hace una petición innecesaria.

### 4. Identidad de una asignatura

Una asignatura con `id` que no existe en `original` no se trata como nueva ni como modificada: se ignora. No debería ocurrir (todo `id` viene de la carga), y tratarla como nueva duplicaría datos.

### 5. Tipos

Con la 3.0.0, `SubjectPatch` ya declara `id`, así que no hace falta la extensión local que se planteó con la 2.0.0. Se mantiene `SubjectWithId` (con `id` opcional) como tipo de dominio de la lista cargada y editada.

## Risks / Trade-offs

- **[Back no migrado]** Un front en 3.0.0 contra un back con el contrato anterior rompe la edición de asignaturas, y al revés. → Mitigación: desplegar ambos de forma coordinada; este cambio no se despliega hasta confirmar que el back expone la 3.0.0.
- **[Edición concurrente]** El cálculo se hace contra la lista que vio el usuario al abrir. Si otra persona modifica el curso entre medias, gana el último guardado. → Mejora respecto a enviar la lista completa: las asignaturas añadidas por otros no se borran, porque no estaban en la lista original.
- **[Guardado parcial]** Se llama primero a `updateSubjects` y después a `updateCourse`. Si la segunda falla, las asignaturas ya cambiaron. → Mismo riesgo que antes; el mensaje de error informa de que el guardado no se completó. Se documenta, sin resolverlo aquí.
- **[Colisión de códigos]** Un `code` repetido puede ser rechazado por el back. → Se muestra con el mensaje de error existente y el panel sigue abierto.

## Migration Plan

Sin migración de datos. Pasos: subir la dependencia a `^3.0.0` y reinstalar, aplicar el cambio de código y desplegar junto con el back en el contrato 3.0.0. Rollback: revertir el commit y la dependencia, y volver a la versión anterior del back; las dos versiones del contrato no son compatibles entre sí, así que el rollback debe coordinarse con el back.

## Open Questions

- ¿El back acepta en `update` los cuatro campos de la asignatura aunque sólo haya cambiado uno? Se asume que sí, porque la operación es un parche y los campos enviados son los vigentes. No cambia el diseño ni las tareas; se confirma en la revisión manual contra un back con el contrato 3.0.0.
