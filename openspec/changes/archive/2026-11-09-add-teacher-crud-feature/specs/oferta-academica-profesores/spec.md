# Spec Delta

## Purpose

Describe el listado paginado y la búsqueda de profesores del catálogo académico, implementados en `libs/academic-offer/teacher-crud-feature` y accesibles en `/academic-offer/teachers` solo para usuarios autenticados. Es la base de lectura de profesores; no incluye alta, edición ni baja.

## ADDED Requirements

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

El sistema SHALL mostrar las columnas Nombre, Apellidos, Email y Estado. Sólo se muestran campos que existen en el modelo `Teacher` de la API.

#### Scenario: Estado del profesor

- **WHEN** un profesor tiene estado `ACTIVE` o `INACTIVE`
- **THEN** el chip muestra la etiqueta en castellano ("Activo" para `ACTIVE`, "Inactivo" para `INACTIVE`)
- **AND** el color del chip es distinto según el estado

#### Scenario: Valor de estado desconocido

- **WHEN** un profesor llega con un estado que no es `ACTIVE` ni `INACTIVE`
- **THEN** el chip muestra el valor tal cual llega, con color por defecto

### Requirement: Acceso protegido al listado de profesores

El sistema MUST mostrar el listado de profesores sólo a usuarios autenticados, con las mismas restricciones que el listado de cursos: sin sesión, la ruta redirige a `/login` conservando la ruta de origen.

#### Scenario: Usuario sin sesión

- **WHEN** un usuario sin sesión accede a `/academic-offer/teachers`
- **THEN** se redirige a `/login`

#### Scenario: Usuario autenticado

- **WHEN** un usuario autenticado accede a `/academic-offer/teachers`
- **THEN** se muestra el listado de profesores dentro del layout de la aplicación
