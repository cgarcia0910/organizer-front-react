# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
