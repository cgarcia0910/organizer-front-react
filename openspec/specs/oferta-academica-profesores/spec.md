# oferta-academica-profesores Specification

## Purpose

Describe el listado paginado y la búsqueda de profesores del catálogo académico, implementados en `libs/academic-offer/teacher-crud-feature` y accesibles en `/academic-offer/teachers` solo para usuarios autenticados. Es la base de lectura de profesores; no incluye alta, edición ni baja.

## Requirements

### Requirement: Listado paginado de profesores

El sistema SHALL mostrar los profesores en una tabla con paginación del lado del servidor. El tamaño de página por defecto es 10 y las opciones son 5, 10, 25 y 50. El total de filas viene de `totalElements` de la respuesta.

#### Scenario: Carga inicial

- **WHEN** el usuario accede a `/academic-offer/teachers`
- **THEN** se llama a `GET /resources/teachers` con `page` (índice base 0 de la tabla) y `size=10`
- **AND** las filas muestran los profesores de `items`

#### Scenario: Cambio de página

- **WHEN** el usuario cambia de página o de tamaño de página
- **THEN** se vuelve a consultar el listado con los nuevos valores
- **AND** mientras carga se muestra el indicador de carga de la tabla

#### Scenario: Error al cargar

- **WHEN** la petición del listado falla
- **THEN** se muestra un mensaje de error visible al usuario y la tabla no muestra filas antiguas

### Requirement: Búsqueda de profesores

El sistema SHALL ofrecer un campo de búsqueda que envía el texto como parámetro `search` al servidor. El servidor busca por nombre, apellidos o email. Una cadena vacía no envía parámetro.

#### Scenario: Búsqueda con texto

- **WHEN** el usuario escribe "garcia" en el campo de búsqueda
- **THEN** se consulta el listado con `search=garcia`

#### Scenario: Búsqueda vacía

- **WHEN** el campo de búsqueda está vacío
- **THEN** se consulta el listado sin parámetro `search`

#### Scenario: Página al cambiar la búsqueda

- **WHEN** el usuario cambia el texto de búsqueda estando en una página distinta de la primera
- **THEN** la paginación vuelve a la página 0 antes de consultar

### Requirement: Columnas del listado de profesores

El sistema SHALL mostrar las columnas Nombre, Apellidos, Email, Estado y Acciones. Sólo se muestran campos que existen en el modelo `Teacher` de la API.

#### Scenario: Estado del profesor

- **WHEN** un profesor tiene estado `ACTIVE` o `INACTIVE`
- **THEN** el chip muestra la etiqueta en castellano ("Activo" para `ACTIVE`, "Inactivo" para `INACTIVE`)
- **AND** el color del chip es distinto según el estado

#### Scenario: Valor de estado desconocido

- **WHEN** un profesor llega con un estado que no es `ACTIVE` ni `INACTIVE`
- **THEN** el chip muestra el valor tal cual llega, con color por defecto

#### Scenario: Acción de editar por fila

- **WHEN** se muestra una fila
- **THEN** hay un botón "Editar profesor" que abre el formulario de edición con los datos de esa fila
- **AND** no hay botón de eliminar

### Requirement: Acceso protegido al listado de profesores

El sistema MUST mostrar el listado de profesores sólo a usuarios autenticados, con las mismas restricciones que el listado de cursos: sin sesión, la ruta redirige a `/login` conservando la ruta de origen.

#### Scenario: Usuario sin sesión

- **WHEN** un usuario sin sesión accede a `/academic-offer/teachers`
- **THEN** se redirige a `/login`

#### Scenario: Usuario autenticado

- **WHEN** un usuario autenticado accede a `/academic-offer/teachers`
- **THEN** se muestra el listado de profesores dentro del layout de la aplicación

### Requirement: Alta de profesor

El sistema SHALL abrir un panel lateral con el formulario "Nuevo profesor" al pulsar "Nuevo profesor" en la cabecera. El formulario SHALL validar antes de enviar.

#### Scenario: Envío válido de alta

- **WHEN** el formulario es válido y el usuario pulsa "Guardar profesor"
- **THEN** el panel permanece abierto hasta recibir la respuesta de la API
- **AND** se llama a `POST /resources/teachers` con `firstName`, `lastName` y `email`
- **AND** al terminar con éxito el panel se cierra y se invalida la caché de `teachers` para que el listado se actualice

#### Scenario: Error al dar de alta

- **WHEN** falla la creación del profesor
- **THEN** se muestra un mensaje de error visible al usuario
- **AND** el panel permanece abierto con los datos introducidos, para que el usuario pueda reintentar

### Requirement: Edición de profesor

El sistema SHALL permitir editar un profesor desde su botón "Editar profesor". El formulario de edición SHALL mostrar los datos actuales de la fila.

#### Scenario: Envío válido de edición

- **WHEN** el usuario guarda un profesor editado con datos válidos
- **THEN** el panel permanece abierto hasta recibir la respuesta de la API
- **AND** se llama a `PATCH /resources/teachers/{id}` (`updateTeacher`) con `firstName`, `lastName` y `email`
- **AND** al terminar con éxito el panel se cierra y se invalida la caché de `teachers`

#### Scenario: Error al editar

- **WHEN** falla el guardado de un profesor editado
- **THEN** se muestra un mensaje de error visible al usuario
- **AND** el panel permanece abierto con los datos introducidos

#### Scenario: Edición sin cambios

- **WHEN** el usuario guarda sin modificar ningún campo
- **THEN** se llama igualmente a `PATCH /resources/teachers/{id}` con los datos actuales

### Requirement: Validación del formulario de profesor

El formulario de profesor SHALL validar antes de enviar. Ningún campo puede enviarse vacío y el email debe tener un formato válido.

#### Scenario: Campos obligatorios vacíos

- **WHEN** el usuario envía el formulario con nombre, apellidos o email vacíos
- **THEN** se muestran los errores en cada campo vacío y no se llama a la API

#### Scenario: Email con formato inválido

- **WHEN** el usuario envía el formulario con un email sin formato válido
- **THEN** se muestra un error en el campo email y no se llama a la API

#### Scenario: Espacios al inicio y al final

- **WHEN** el usuario escribe nombre, apellidos o email con espacios al inicio o al final
- **THEN** los espacios se eliminan antes de validar y de enviar
