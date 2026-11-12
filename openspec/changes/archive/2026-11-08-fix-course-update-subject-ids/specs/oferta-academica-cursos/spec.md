# Spec Delta

## MODIFIED Requirements

### Requirement: Edición de curso

El sistema SHALL permitir editar un curso existente desde el botón "Editar curso". Antes de abrir el formulario, SHALL cargar todas sus asignaturas, incluidas las inactivas. Al guardar, SHALL enviar la lista completa de asignaturas del curso, donde cada asignatura existente lleva su `id` y cada asignatura nueva no lleva `id`. La lista enviada es la fuente de verdad del conjunto de asignaturas: el back decide si crea, edita o borra.

#### Scenario: Carga de asignaturas

- **WHEN** el usuario pulsa "Editar curso"
- **THEN** se cargan todas las asignaturas del curso, recorriendo todas las páginas de `GET /resources/courses/{id}/subjects` e incluyendo las inactivas
- **AND** el formulario se abre con los datos del curso y la lista completa de asignaturas

#### Scenario: Fallo al cargar asignaturas (comportamiento actual)

- **WHEN** falla la carga de asignaturas
- **THEN** se muestra un mensaje de error visible al usuario
- **AND** el panel de edición no se abre

#### Scenario: Guardado de cambios

- **WHEN** el usuario guarda un curso editado
- **THEN** el panel permanece abierto hasta recibir la respuesta de la API
- **AND** cada asignatura que ya existía se envía con su `id`
- **AND** cada asignatura añadida en el formulario se envía sin `id`
- **AND** las asignaturas que el usuario quitó del formulario no aparecen en la lista enviada
- **AND** se llama primero a `PATCH /resources/courses/{id}/subjects` (`updateSubjects`) con la lista completa, y después a `PATCH /resources/courses/{id}` (`updateCourse`)
- **AND** al terminar con éxito el panel se cierra y se invalida la caché de `courses`
- **AND** si el guardado falla, se muestra un mensaje de error visible al usuario y el panel permanece abierto con los datos introducidos
