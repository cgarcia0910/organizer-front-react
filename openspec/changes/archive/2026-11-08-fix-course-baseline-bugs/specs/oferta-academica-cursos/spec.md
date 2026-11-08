# Spec Delta

## MODIFIED Requirements

### Requirement: Columnas del listado

El sistema SHALL mostrar las columnas Código, Nombre del curso (con la descripción debajo si existe), Estado y Acciones. Solo se muestran campos que existen en el modelo `Course` de la API.

#### Scenario: Estado del curso (comportamiento actual)

- **WHEN** un curso tiene estado `ACTIVE` o `INACTIVE`
- **THEN** el chip muestra la etiqueta en castellano ("Activo" para `ACTIVE`, "Inactivo" para `INACTIVE`)
- **AND** el color del chip es distinto según el estado

#### Scenario: Modalidad y duración (incompleto)

- **WHEN** se muestra el listado
- **THEN** no se muestran las columnas Modalidad ni Duración, porque el modelo `Course` de la API no tiene esos campos

#### Scenario: Acciones por fila

- **WHEN** se muestra una fila
- **THEN** hay un botón "Editar curso" y un botón "Eliminar curso"

### Requirement: Creación de curso

El sistema SHALL abrir un panel lateral con el formulario "Nuevo curso" al pulsar "Nuevo curso". El formulario SHALL validar antes de enviar.

#### Scenario: Validación del formulario

- **WHEN** el usuario envía el formulario con datos inválidos
- **THEN** se muestran los errores en cada campo y no se llama a la API
- **AND** "Nombre del curso", "Código" son obligatorios
- **AND** debe haber al menos una asignatura
- **AND** cada asignatura exige nombre y código no vacíos, y `hoursPerWeek` y `maxHoursPerDay` como enteros mayores o iguales a 1

#### Scenario: Envío válido

- **WHEN** el formulario es válido y el usuario pulsa "Guardar curso"
- **THEN** el panel permanece abierto hasta recibir la respuesta de la API
- **AND** se llama a `POST /resources/courses` con los datos del curso
- **AND** después se llama a `POST /resources/courses/{id}/subjects` con el array de asignaturas en una sola petición
- **AND** al terminar con éxito el panel se cierra y se invalida la caché de `courses` para que el listado se actualice

#### Scenario: Código de asignatura sustituido (comportamiento actual)

- **WHEN** se envían asignaturas al crear un curso
- **THEN** el campo `code` de cada asignatura es el código introducido por el usuario, no el nombre

#### Scenario: Error al guardar (comportamiento actual)

- **WHEN** falla la creación del curso o de sus asignaturas
- **THEN** se muestra un mensaje de error visible al usuario
- **AND** el panel permanece abierto con los datos introducidos, para que el usuario pueda reintentar

#### Scenario: Estado por defecto

- **WHEN** se abre el formulario de creación
- **THEN** el estado es `ACTIVE` ("Activo") y hay una asignatura vacía con 1 hora semanal y 1 máxima diaria

### Requirement: Edición de curso

El sistema SHALL permitir editar un curso existente desde el botón "Editar curso". Antes de abrir el formulario, SHALL cargar sus asignaturas.

#### Scenario: Carga de asignaturas

- **WHEN** el usuario pulsa "Editar curso"
- **THEN** se llama a `GET /resources/courses/{id}/subjects` sin parámetros de paginación ni de inactivos
- **AND** el formulario se abre con los datos del curso y las asignaturas de la primera página de la respuesta

#### Scenario: Fallo al cargar asignaturas (comportamiento actual)

- **WHEN** falla la carga de asignaturas
- **THEN** se muestra un mensaje de error visible al usuario
- **AND** el panel de edición no se abre

#### Scenario: Guardado de cambios

- **WHEN** el usuario guarda un curso editado
- **THEN** el panel permanece abierto hasta recibir la respuesta de la API
- **AND** se llama primero a `PATCH /resources/courses/{id}/subjects` (`updateSubjects`, en lote) y después a `PATCH /resources/courses/{id}` (`updateCourse`)
- **AND** el campo `code` de cada asignatura enviada es el código introducido por el usuario, no el nombre
- **AND** al terminar con éxito el panel se cierra y se invalida la caché de `courses`
- **AND** si el guardado falla, se muestra un mensaje de error visible al usuario y el panel permanece abierto con los datos introducidos
