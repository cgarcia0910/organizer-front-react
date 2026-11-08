# Spec Delta

## MODIFIED Requirements

### Requirement: Edición de curso

El sistema SHALL permitir editar un curso existente desde el botón "Editar curso". Antes de abrir el formulario, SHALL cargar todas sus asignaturas activas, recorriendo todas las páginas. Al guardar, SHALL comparar las asignaturas cargadas con las editadas y enviar por separado las asignaturas nuevas, las modificadas y las eliminadas.

#### Scenario: Carga de asignaturas

- **WHEN** el usuario pulsa "Editar curso"
- **THEN** se cargan las asignaturas activas del curso, recorriendo todas las páginas de `GET /resources/courses/{id}/subjects` sin incluir las inactivas (`includeInactive=false`)
- **AND** el formulario se abre con los datos del curso y la lista completa de asignaturas

#### Scenario: Fallo al cargar asignaturas

- **WHEN** falla la carga de asignaturas
- **THEN** se muestra un mensaje de error visible al usuario
- **AND** el panel de edición no se abre

#### Scenario: Guardado de cambios

- **WHEN** el usuario guarda un curso editado
- **THEN** el panel permanece abierto hasta recibir la respuesta de la API
- **AND** si hay cambios en asignaturas, se llama primero a `PATCH /resources/courses/{id}/subjects` (`updateSubjects`) con un único cuerpo que agrupa las nuevas (`new`), las modificadas (`update`) y las eliminadas (`delete`), y después a `PATCH /resources/courses/{id}` (`updateCourse`)
- **AND** el cuerpo sólo incluye los grupos que tienen contenido
- **AND** al terminar con éxito el panel se cierra y se invalida la caché de `courses`
- **AND** si el guardado falla, se muestra un mensaje de error visible al usuario y el panel permanece abierto con los datos introducidos

#### Scenario: Asignatura nueva

- **WHEN** el usuario añade una asignatura en el formulario de edición y guarda
- **THEN** esa asignatura se envía en `new`, con `code`, `name`, `hoursPerWeek` y `maxHoursPerDay`, y sin `id`

#### Scenario: Asignatura modificada

- **WHEN** el usuario cambia algún campo de una asignatura que ya existía y guarda
- **THEN** esa asignatura se envía en `update`, con su `id` y sus campos actuales
- **AND** las asignaturas existentes que no cambiaron no se envían

#### Scenario: Asignatura eliminada

- **WHEN** el usuario quita del formulario una asignatura que ya existía y guarda
- **THEN** el `id` de esa asignatura se envía en `delete`

#### Scenario: Sin cambios en asignaturas

- **WHEN** el usuario guarda un curso editado sin haber añadido, modificado ni quitado ninguna asignatura
- **THEN** no se llama a `PATCH /resources/courses/{id}/subjects`
- **AND** sí se llama a `PATCH /resources/courses/{id}` (`updateCourse`)
