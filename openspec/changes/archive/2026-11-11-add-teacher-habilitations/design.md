# Design

## Context

El formulario de profesor (`NewEditTeacherForm`, dentro de un `Drawer` en `teachers-page.tsx`) ya guarda los datos del profesor con `createTeacher` o `updateTeacher`. El formulario de curso (`NewEditCourseForm`) gestiona sus asignaturas con `useFieldArray`, y el guardado de cursos llama a `createCourse` + `createSubject`, o a `updateSubjects` + `updateCourse`. Ver `specs/` para los requisitos.

El cliente 4.0.0 expone `HabilitationsApi` con `listTeacherHabilitations` (`page`, `size`, `status`, `effective`), `createHabilitations` (lista de `{ courseId, subjectId }`) y `revokeHabilitation`, que se retira en la siguiente versión del cliente y no se usa. No hay actualización de habilitaciones.

Las asignaturas de un curso se leen con `getCourseSubjects` (`courses-crud-feature`), que recorre todas las páginas y rechaza si alguna falla.

## Goals / Non-Goals

**Goals:**
- Dar de alta y ver las habilitaciones desde el mismo formulario que los datos del profesor, igual que las asignaturas en cursos.
- Que un reintento tras un fallo parcial no cree duplicados.

**Non-Goals:**
- Editar o revocar habilitaciones existentes.
- Paginación y filtros de habilitaciones.
- Búsqueda de cursos en servidor.

## Decisions

**1. Una sola función de guardado por operación, en la capa de casos de uso.**
`createTeacher(input)` llama a `POST /teachers` y después, si hay filas, a `createHabilitations`. `updateTeacher(input)` hace `PATCH` y después, si hay filas nuevas, `createHabilitations`. El formulario sólo llama a una de las dos. Así la regla de orden está en un único lugar.

**2. El profesor se crea antes que sus habilitaciones.**
Si el `POST` de habilitaciones falla tras crear el profesor, el error lleva el id del profesor creado (`PartialSaveError`). El formulario guarda ese id y pasa a modo edición: un nuevo guardado hace `PATCH` (idempotente) y el `POST` de las filas. *Alternativa descartada*: habilitaciones primero, como en cursos. Un fallo del `PATCH` tras crear habilitaciones obligaría a reintentar un `POST` que ya llegó, y duplicaría.

**3. Las filas nuevas se envían tal cual, sin diff.**
Como no hay actualización de habilitaciones, en edición sólo se envían las filas añadidas. Las existentes se leen y se muestran, pero no se comparan con nada.

**4. Exclusión de asignaturas ya habilitadas.**
El selector de asignatura filtra las que tienen habilitación `ACTIVE` para ese curso, según las existentes cargadas. En alta no hay existentes, así que no filtra nada.

**5. Nombres de curso y asignatura.**
La API devuelve ids. Los nombres se resuelven con la primera página de `listCourses` (50) y con `getCourseSubjects` por cada curso que aparece en las existentes. Si un nombre no se resuelve, se muestra el id.

**6. Claves de caché.**
Las existentes usan `['teacher-habilitations', teacherId]`. Tras cualquier guardado con filas se invalida esa clave, además de `['teachers']`. Si falla el `POST`, también se invalida, porque el estado del servidor puede haber cambiado.

**7. Efectividad mostrada tal cual la devuelve la API.**
La columna "Efectiva" usa `effective` y `effectiveStatusReason`. El front no recalcula nada.

## Risks / Trade-offs

- **Fallo parcial al crear**: el formulario queda en modo edición del profesor creado, y el usuario lo ve en el mensaje. → Mitigación: mensaje explícito de que el profesor se creó.
- **Duplicados entre filas nuevas**: el usuario podría elegir la misma asignatura en dos filas. → Mitigación: validación de filas repetidas antes de enviar.
- **Más de 50 cursos o 50 habilitaciones**: el selector y la tabla sólo muestran la primera página. → Mitigación: aceptable con el volumen esperado (unas 10 habilitaciones por profesor).
- **Reutilizar `getCourseSubjects` desde otra librería**: ya resuelto con la exportación del índice y la referencia en `tsconfig.lib.json`.
- **Actualización a 4.0.0 sin commit**: el fallo de compilación se mezclaría con este cambio. → Mitigación: tarea de verificación previa (grupo 1).

## Migration Plan

No hay migración de datos. El back debe exponer `HabilitationsApi` de 4.0.0. Rollback: revertir el commit; la versión 4.0.0 puede quedarse sin afectar a cursos ni profesores.

## Open Questions

- ¿El back rechaza duplicados con un código concreto (p. ej. 409)? Si lo hace, se puede mostrar un mensaje específico. No cambia los requisitos.
