# Oferta académica: cursos Specification

## Purpose

Describe la gestión del catálogo de cursos y de sus asignaturas desde la interfaz: listado paginado, búsqueda, creación y edición. Implementado en `libs/academic-offer/courses-crud-feature`, ruta `/academic-offer/courses`.

Los requisitos describen el comportamiento actual. Donde el código está incompleto o no coincide con la API, el escenario lo indica como *(comportamiento actual)* o *(incompleto)*. Un cambio que corrija esos puntos debe proponerse como un *change* con `MODIFIED`.

Fuentes: `src/lib/presentation/**`, `src/lib/application/use-cases/*.ts`, `src/lib/domain/entities/*.ts`. Contrato de la API: `@cgarcia0910/api-academiccatalog` v2.0.0.

## Requirements

### Requirement: Listado paginado de cursos

El sistema SHALL mostrar los cursos en un `DataGrid` con paginación del lado del servidor. El tamaño de página por defecto es 10 y las opciones son 5, 10, 25 y 50. El total de filas viene de `totalElements` de la respuesta.

#### Scenario: Carga inicial

- **WHEN** el usuario accede a `/academic-offer/courses`
- **THEN** se llama a `GET /resources/courses` con `page` (índice base 0 del DataGrid), `size=10`, `includeInactive=true`
- **AND** las filas muestran los cursos de `items`

#### Scenario: Cursos inactivos incluidos

- **WHEN** se carga el listado
- **THEN** se incluyen los cursos con estado `INACTIVE` (el parámetro `includeInactive` es siempre `true`)

#### Scenario: Cambio de página

- **WHEN** el usuario cambia de página o de tamaño de página
- **THEN** se vuelve a consultar el listado con los nuevos valores
- **AND** mientras carga se muestra el indicador de carga del DataGrid

#### Scenario: Ordenación (incompleto)

- **WHEN** el usuario pulsa una cabecera de columna para ordenar
- **THEN** no se envían `sort` ni `direction` al servidor; el listado no cambia *(incompleto: `sortingMode="server"` sin manejador)*

#### Scenario: Error al cargar (comportamiento actual)

- **WHEN** la petición del listado falla
- **THEN** no se muestra ningún mensaje de error; la tabla queda sin datos *(el hook no lee `isError`)*

### Requirement: Búsqueda de cursos

El sistema SHALL ofrecer un campo de búsqueda que envía el texto como parámetro `search` al servidor. Una cadena vacía no envía parámetro.

#### Scenario: Búsqueda con texto

- **WHEN** el usuario escribe "mat" en el campo de búsqueda
- **THEN** se consulta el listado con `search=mat`

#### Scenario: Búsqueda vacía

- **WHEN** el campo de búsqueda está vacío
- **THEN** se consulta el listado sin parámetro `search`

#### Scenario: Página al cambiar la búsqueda (comportamiento actual)

- **WHEN** el usuario cambia el texto de búsqueda estando en una página distinta de la primera
- **THEN** la paginación no se reinicia a la página 0

### Requirement: Filtro de estado (incompleto)

El sistema SHALL mostrar un selector de estado con las opciones "Todos", "Activo", "Borrador" e "Inactivo".

#### Scenario: Selección de un estado (incompleto)

- **WHEN** el usuario selecciona un estado distinto de "Todos"
- **THEN** el listado no cambia: el valor se guarda en estado local y no se envía al servidor
- **AND** las etiquetas no coinciden con la API, que usa `ACTIVE` e `INACTIVE` y no tiene estado "Borrador"

### Requirement: Columnas del listado

El sistema SHALL mostrar las columnas Código, Nombre del curso (con la descripción debajo si existe), Estado y Acciones. Solo se muestran campos que existen en el modelo `Course` de la API.

#### Scenario: Estado del curso

- **WHEN** un curso tiene estado `ACTIVE` o `INACTIVE`
- **THEN** el chip muestra la etiqueta en castellano ("Activo" para `ACTIVE`, "Inactivo" para `INACTIVE`)
- **AND** el color del chip es distinto según el estado

#### Scenario: Modalidad y duración

- **WHEN** se muestra el listado
- **THEN** no se muestran las columnas Modalidad ni Duración, porque el modelo `Course` de la API no tiene esos campos

#### Scenario: Acciones por fila

- **WHEN** se muestra una fila
- **THEN** hay un botón "Editar curso" y un botón "Eliminar curso"


### Requirement: Eliminación de cursos (no implementada)

El sistema MUST NOT borrar cursos en el backend desde la interfaz actual.

#### Scenario: Pulsar eliminar

- **WHEN** el usuario pulsa "Eliminar curso"
- **THEN** no se llama a la API; solo se escribe `delete` con el curso en la consola del navegador

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

#### Scenario: Código de asignatura enviado

- **WHEN** se envían asignaturas al crear un curso
- **THEN** el campo `code` de cada asignatura es el código introducido por el usuario, no el nombre

#### Scenario: Error al guardar

- **WHEN** falla la creación del curso o de sus asignaturas
- **THEN** se muestra un mensaje de error visible al usuario
- **AND** el panel permanece abierto con los datos introducidos, para que el usuario pueda reintentar

#### Scenario: Estado por defecto

- **WHEN** se abre el formulario de creación
- **THEN** el estado es `ACTIVE` ("Activo") y hay una asignatura vacía con 1 hora semanal y 1 máxima diaria


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


### Requirement: Modelo de datos del curso

El sistema SHALL tratar un curso con los campos `id`, `code`, `name`, `description` (opcional), `status` (`ACTIVE` o `INACTIVE`), `createdAt` y `updatedAt`. Las asignaturas del formulario tienen `code`, `name`, `hoursPerWeek` y `maxHoursPerDay`.

#### Scenario: Asignaturas dentro del curso

- **WHEN** se crea o edita un curso
- **THEN** las asignaturas se gestionan solo dentro del formulario del curso; no hay pantalla propia de asignaturas

## Gaps no especificados como requisitos

Estas funciones existen en la API o en el código, pero la interfaz no las expone. No se describen como requisitos porque no están implementadas en el front:

- Desactivar y reactivar cursos (`reactivateCourse`, y el equivalente de desactivación de asignaturas). En la API, la reactivación es exclusiva de `CATALOG_ADMIN`.
- Cambio de estado de un curso desde el listado.
- Resumen de cursos (`CoursesSummary.tsx`). El componente no se importa y no compila (variables `courses` y `totalRows` no definidas).
- Modalidad y duración del curso (no existen en la API).
