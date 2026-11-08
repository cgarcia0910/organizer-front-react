# Design

## Context

Estado actual, verificado en el código:

- `NewEditCourseForm.tsx` parte de `course.subjects`, que viene de `getCourseSubjects`. El `courseSchema` es un `z.object` que descarta claves no declaradas, así que el `id` de cada asignatura se elimina al validar. Ver proposal.md, *Why*.
- `getCourseSubjects` llama a `listSubjects` sin `size` ni `includeInactive`. El tamaño por defecto lo decide el servidor y no está documentado en el cliente. Las asignaturas inactivas no llegan.
- `updateCourse` (use case) llama a `updateSubjects(courseId, subjects)`. El cliente generado tipa el cuerpo como `Array<SubjectPatch>`, y `SubjectPatch` no tiene `id`. El cliente es una dependencia externa (`@cgarcia0910/api-academiccatalog` 2.0.0), no se regenera desde este repositorio.
- `updateSubject` (singular) sí recibe `subjectId` en la ruta, pero es por asignatura, no por lista.

Con el contrato de lista completa, dos fallos de lectura se convierten en borrados reales: una página incompleta y las inactivas omitidas. Por eso la carga debe ser completa antes de permitir guardar.

## Goals / Non-Goals

**Goals:**
- Enviar la lista completa con `id` en las existentes y sin `id` en las nuevas.
- Garantizar que la lista cargada para editar es el conjunto completo del curso.
- Dejar el envío listo para un PUT futuro sin cambiar la forma de los datos.

**Non-Goals:**
- Cambiar el método HTTP ni añadir un endpoint nuevo.
- Modificar el cliente generado.
- Desactivar o reactivar asignaturas desde la interfaz.

## Decisions

### 1. Tipo de la asignatura enviada: extender `SubjectPatch` localmente

Se define en el dominio un tipo `SubjectWithId = Subject & { id?: string }` y el caso de uso `updateCourse` lo acepta. Al llamar a `updateSubjects`, se pasa como `SubjectPatch[]`: `id` es una clave extra que TypeScript permite en un tipo ampliado, y el cliente la serializa tal cual.

*Alternativas consideradas*:
- Esperar a una versión del cliente con `id` en `SubjectPatch`. Se descarta: no depende de este repositorio y bloquea el arreglo.
- Usar axios directamente para el PATCH. Se descarta: rompe el patrón del cliente generado y duplica la configuración base.

*Riesgo*: si el back ignora `id` en el cuerpo del PATCH en lote, el cambio no funciona. Ver Open Questions.

### 2. Carga completa de asignaturas

`getCourseSubjects` recorre todas las páginas de `listSubjects` con `includeInactive=true`, leyendo `totalPages` de la primera respuesta. El tamaño de página se fija explícitamente (no se depende del valor por defecto del servidor). La función devuelve un array plano, no un `Page`.

*Alternativa considerada*: pedir una sola página con `size` grande. Se descarta: no hay garantía del máximo permitido por el servidor, y un fallo silencioso volvería a borrar asignaturas.

### 3. Conservar `id` en el formulario

Se añade `id: z.string().optional()` al objeto de asignatura de `courseSchema`, para que zod no lo elimine. Las asignaturas nuevas no tienen `id` (el `defaultValues` no lo incluye), así que el envío cumple el contrato sin lógica extra.

`useFieldArray` usa por defecto la clave `id` para sus propios identificadores de fila. Hay que verificar en la implementación que no sobrescribe el `id` de la asignatura en los valores enviados; si lo hace, se fija `keyName` a otro nombre.

### 4. Quitar asignaturas

Quitar una asignatura del formulario la elimina de la lista enviada. El back la interpreta como borrado. Esta es la consecuencia directa del contrato de lista completa, que el usuario ha confirmado.

## Risks / Trade-offs

- **[Borrado no intencionado]** Si la carga falla en parte o se omiten inactivas, el guardado borra asignaturas. → Mitigación: la carga es todo-o-nada; si cualquier página falla, el panel no se abre (ya definido en el requisito de fallo al cargar). Las inactivas se piden explícitamente.
- **[Contrato del back no confirmado]** El back debe aceptar `id` en el PATCH en lote y tratar la lista como conjunto completo. → Mitigación: confirmar con el equipo de back antes de desplegar; el cambio en front es inocuo si el back aún no lo soporta, pero el guardado de ediciones con asignaturas no se comportará como se espera.
- **[Tipo ampliado frente al cliente]** `SubjectWithId` depende de que el cliente siga serializando campos extra. → Mitigación: un test del caso de uso comprueba el cuerpo enviado.
- **[Carga más lenta]** Un curso con muchas páginas tarda más en abrir el formulario. → Aceptable para el volumen esperado; se mide en la revisión manual.

## Migration Plan

Sin migración de datos. El despliegue del front debe ir después de confirmar el contrato del back. Rollback: revertir el commit; el comportamiento anterior (sin `id`) vuelve a aplicar.

Orden de archivo: `fix-course-baseline-bugs` debe archivarse antes que este cambio, porque ambos modifican el mismo requisito y el delta de este cambio reescribe el texto completo.

## Open Questions

Ninguna. El comportamiento del back (crear, editar o borrar según la presencia y el `id` de cada asignatura en la lista completa) lo ha definido el usuario. Queda como verificación de despliegue: confirmar que el endpoint acepta `id` en el cuerpo del PATCH en lote tal como se describe.
