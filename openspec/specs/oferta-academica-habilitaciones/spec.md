# oferta-academica-habilitaciones Specification

## Purpose

TBD - creada al archivar el change add-teacher-habilitations. Actualizar el Purpose a mano: describe las habilitaciones de un profesor (curso y asignatura para los que está habilitado), vistas y dadas de alta desde el formulario de profesor.

## Requirements

### Requirement: Sección de habilitaciones en el formulario de profesor

El sistema SHALL mostrar una sección "Habilitaciones" dentro del formulario de profesor, debajo de los datos del profesor, tanto en alta como en edición. La sección sigue el mismo patrón que las asignaturas de un curso: filas dinámicas que se añaden y se quitan antes de guardar.

#### Scenario: Alta sin habilitaciones

- **WHEN** el usuario abre el formulario de alta
- **THEN** la sección muestra una lista vacía de nuevas habilitaciones
- **AND** no se muestra la lista de habilitaciones existentes

#### Scenario: Edición con habilitaciones existentes

- **WHEN** el usuario abre el formulario de edición de un profesor
- **THEN** la sección muestra sus habilitaciones existentes en una tabla de sólo lectura
- **AND** debajo muestra la lista de nuevas habilitaciones, vacía

### Requirement: Listado de habilitaciones existentes

El sistema SHALL mostrar las habilitaciones existentes de un profesor en una tabla de sólo lectura con las columnas Curso, Asignatura, Estado y Efectiva. Se consulta `GET /resources/teachers/{teacherId}/habilitations` con `page=0` y `size=50`, sin paginación en la interfaz.

#### Scenario: Estado de la habilitación

- **WHEN** una habilitación tiene estado `ACTIVE`
- **THEN** el chip muestra "Activa"
- **WHEN** una habilitación tiene estado `REVOKED`
- **THEN** el chip muestra "Revocada"

#### Scenario: Habilitación efectiva

- **WHEN** una habilitación tiene `effective=true`
- **THEN** la columna Efectiva muestra "Sí"

#### Scenario: Habilitación no efectiva

- **WHEN** una habilitación tiene `effective=false`
- **THEN** la columna Efectiva muestra "No" y el motivo de `effectiveStatusReason` en castellano: "Profesor inactivo", "Curso inactivo" o "Asignatura inactiva"

#### Scenario: Sin habilitaciones existentes

- **WHEN** el profesor no tiene habilitaciones
- **THEN** la tabla muestra el mensaje "Este profesor no tiene habilitaciones"

#### Scenario: Error al cargar las existentes

- **WHEN** la petición de habilitaciones existentes falla
- **THEN** se muestra un mensaje de error en la sección y no se muestran filas antiguas
- **AND** el formulario sigue permitiendo guardar los datos del profesor

### Requirement: Filas de nuevas habilitaciones

El sistema SHALL permitir añadir filas de nuevas habilitaciones. Cada fila elige un curso y una asignatura de ese curso. El usuario puede añadir y quitar filas antes de guardar. Las habilitaciones no son obligatorias.

#### Scenario: Añadir y quitar filas

- **WHEN** el usuario pulsa "Añadir habilitación"
- **THEN** aparece una fila nueva con selectores de curso y de asignatura vacíos
- **WHEN** el usuario pulsa "Quitar habilitación" en una fila
- **THEN** la fila desaparece y no se envía

#### Scenario: Asignaturas del curso elegido

- **WHEN** el usuario elige un curso en una fila
- **THEN** el selector de asignatura de esa fila muestra sólo las asignaturas de ese curso
- **AND** al cambiar el curso de la fila se limpia su asignatura

#### Scenario: Asignatura ya habilitada

- **WHEN** el selector de asignatura muestra las opciones de un curso
- **THEN** no aparecen las asignaturas que ya tienen una habilitación activa para ese profesor

#### Scenario: Asignatura repetida entre filas

- **WHEN** el usuario guarda con dos filas que tienen el mismo curso y la misma asignatura
- **THEN** se muestra el error "Esta asignatura ya está en la lista" en la segunda fila y no se llama a la API

#### Scenario: Fila incompleta

- **WHEN** el usuario guarda con una fila sin curso o sin asignatura
- **THEN** se muestra el error en esa fila y no se llama a la API

### Requirement: Alta de profesor con habilitaciones

El sistema SHALL, al guardar un alta, crear primero el profesor con `POST /resources/teachers` y después, si hay filas, enviar todas las filas en una única llamada a `POST /resources/teachers/{teacherId}/habilitations` con la lista de `{ courseId, subjectId }`.

#### Scenario: Alta correcta con habilitaciones

- **WHEN** el usuario guarda un alta con dos filas válidas
- **THEN** se llama a `POST /resources/teachers` y después una sola vez a `POST` de habilitaciones con dos elementos
- **AND** el panel se cierra y el listado se actualiza

#### Scenario: Alta sin habilitaciones

- **WHEN** el usuario guarda un alta sin filas de habilitación
- **THEN** sólo se llama a `POST /resources/teachers`

#### Scenario: Fallo al crear el profesor

- **WHEN** falla `POST /resources/teachers`
- **THEN** se muestra un mensaje de error y no se llama a la API de habilitaciones
- **AND** el formulario conserva los datos y las filas

#### Scenario: Fallo al crear las habilitaciones tras crear el profesor

- **WHEN** el profesor se crea correctamente pero falla el `POST` de habilitaciones
- **THEN** se muestra un mensaje indicando que el profesor se creó y sus habilitaciones no
- **AND** el formulario pasa a modo edición de ese profesor, de forma que un nuevo guardado no crea un segundo profesor

### Requirement: Edición de profesor con habilitaciones

El sistema SHALL, al guardar una edición, enviar primero `PATCH /resources/teachers/{id}` con los datos del profesor y después, si hay filas nuevas, un `POST` de habilitaciones con sólo esas filas.

#### Scenario: Edición con nuevas habilitaciones

- **WHEN** el usuario edita los datos y añade dos filas nuevas
- **THEN** se llama a `PATCH` y después a `POST` de habilitaciones con las dos filas
- **AND** el panel se cierra

#### Scenario: Edición sin filas nuevas

- **WHEN** el usuario guarda una edición sin añadir filas
- **THEN** sólo se llama a `PATCH`

#### Scenario: Fallo en el PATCH

- **WHEN** falla el `PATCH` del profesor
- **THEN** no se llama a `POST` de habilitaciones y se muestra el error
- **AND** las filas nuevas siguen en el formulario

#### Scenario: Fallo en el POST de habilitaciones

- **WHEN** el `PATCH` tiene éxito y falla el `POST` de habilitaciones
- **THEN** se muestra el error y el panel permanece abierto con las filas nuevas
- **AND** un nuevo guardado repite el `PATCH` y envía las filas nuevas

### Requirement: Sin edición ni revocación de habilitaciones

El sistema MUST NOT ofrecer editar ni revocar habilitaciones existentes en esta versión. La edición queda pendiente hasta que el back exponga el endpoint correspondiente.

#### Scenario: Ausencia de acciones sobre existentes

- **WHEN** se muestran las habilitaciones existentes
- **THEN** no hay botones de editar ni de revocar en sus filas

### Requirement: Acceso protegido a habilitaciones

El sistema MUST mostrar y gestionar habilitaciones sólo a usuarios autenticados, con las mismas restricciones que el listado de profesores.

#### Scenario: Usuario sin sesión

- **WHEN** un usuario sin sesión accede al formulario de profesor
- **THEN** se redirige a `/login` conservando la ruta de origen
