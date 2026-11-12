# Autenticación Specification

## Purpose

Describe cómo un usuario inicia y cierra sesión en Campus Admin, cómo se restaura la sesión al cargar la aplicación y cómo se protegen las rutas. Implementado en `libs/auth/login-feature`.

Fuentes: `src/lib/login-feature.tsx`, `src/lib/login.schema.ts`, `src/lib/context/AuthContext.tsx`, `src/lib/components/ProtectedRoute.tsx`, `src/lib/data-access/auth.api.ts`.

## Requirements

### Requirement: Formulario de inicio de sesión

El sistema SHALL mostrar en `/login` un formulario con los campos *Email* y *Password* y un botón *Sign in*. Antes de llamar al backend, el sistema SHALL validar los campos con el esquema `loginSchema`.

#### Scenario: Envío con campos vacíos

- **WHEN** el usuario pulsa *Sign in* sin rellenar ningún campo
- **THEN** se muestra "Email is required." bajo el email y "Password is required." bajo la contraseña
- **AND** no se realiza ninguna petición al backend

#### Scenario: Email con formato inválido

- **WHEN** el usuario introduce un valor de email sin formato válido (por ejemplo, sin `@` o sin dominio) y envía el formulario
- **THEN** se muestra "Please enter a valid email address."
- **AND** no se realiza ninguna petición al backend

#### Scenario: Contraseña sin longitud mínima

- **WHEN** el usuario introduce una contraseña de un solo carácter
- **THEN** el formulario la acepta; no hay longitud mínima en el cliente

### Requirement: Autenticación contra el backend

El sistema SHALL autenticar al usuario enviando `POST /api/auth/login` con `{ email, password }` y, si la respuesta es correcta, SHALL obtener el usuario actual con `GET /api/auth/whoami`.

#### Scenario: Credenciales válidas

- **WHEN** `POST /api/auth/login` responde con código 2xx y `GET /api/auth/whoami` responde 2xx
- **THEN** el contexto de autenticación guarda el usuario devuelto
- **AND** el formulario navega a `/`

#### Scenario: Credenciales rechazadas

- **WHEN** `POST /api/auth/login` responde 401
- **THEN** se muestra "Invalid email or password"
- **AND** no se llama a `whoami`

#### Scenario: Error del servidor en el login

- **WHEN** `POST /api/auth/login` responde con un código distinto de 2xx y distinto de 401
- **THEN** se muestra "Something went wrong, try again later"

#### Scenario: Login correcto pero whoami falla

- **WHEN** `POST /api/auth/login` responde 2xx pero `GET /api/auth/whoami` responde con error
- **THEN** el resultado es de error de servidor y se muestra "Something went wrong, try again later"
- **AND** el usuario no queda autenticado en el contexto

#### Scenario: Backend inaccesible

- **WHEN** la petición de login lanza una excepción de red
- **THEN** se muestra "Could not reach the server"

#### Scenario: Petición en curso

- **WHEN** la petición de login está pendiente
- **THEN** el botón se deshabilita y muestra "Signing in..." con un indicador de progreso

### Requirement: Restauración de sesión al cargar la aplicación

El sistema SHALL consultar `GET /api/auth/whoami` al montar `AuthProvider`. La sesión se mantiene mediante cookie gestionada por el backend; el front-end no almacena credenciales.

#### Scenario: Sesión existente

- **WHEN** la aplicación carga y `whoami` responde 2xx con el usuario
- **THEN** el usuario queda autenticado y `isLoading` pasa a `false`

#### Scenario: Sin sesión

- **WHEN** la aplicación carga y `whoami` responde con error o no responde 2xx
- **THEN** no hay usuario autenticado y `isLoading` pasa a `false`

#### Scenario: Estado de carga

- **WHEN** `whoami` aún no ha respondido
- **THEN** `isLoading` es `true` y las rutas protegidas muestran "Cargando..." sin redirigir

### Requirement: Rutas protegidas

El sistema SHALL envolver las rutas que requieren sesión en `ProtectedRoute`. Mientras la sesión se restaura, SHALL mostrar "Cargando...". Sin usuario, SHALL redirigir a `/login` conservando la ruta solicitada en `location.state.from`.

#### Scenario: Acceso sin sesión

- **WHEN** un usuario sin sesión accede a `/` o a cualquier ruta protegida
- **THEN** es redirigido a `/login`
- **AND** `location.state.from` contiene la ruta original

#### Scenario: Acceso con sesión

- **WHEN** un usuario autenticado accede a una ruta protegida
- **THEN** se renderiza el contenido de la ruta anidada

#### Scenario: Acceso a /login con sesión activa (comportamiento actual)

- **WHEN** un usuario ya autenticado accede a `/login`
- **THEN** se muestra el formulario de login; no hay redirección automática a la aplicación

### Requirement: Cierre de sesión

El sistema SHALL cerrar la sesión enviando `POST /api/auth/logout` y SHALL eliminar el usuario del contexto, aunque la petición falle.

#### Scenario: Logout correcto

- **WHEN** el usuario elige "Cerrar sesión" en el menú de usuario
- **THEN** se llama a `POST /api/auth/logout`
- **AND** el usuario se borra del contexto
- **AND** la ruta protegida redirige a `/login`

#### Scenario: Logout con error de red

- **WHEN** `POST /api/auth/logout` falla
- **THEN** el usuario se borra igualmente del contexto y la aplicación redirige a `/login`

### Requirement: Roles

El tipo `AuthUser` SHALL incluir `roles` con valores `CATALOG_ADMIN` o `CATALOG_EDITOR`, y `tenant` con `id` y `name`.

#### Scenario: Roles visibles

- **WHEN** hay un usuario autenticado
- **THEN** la cabecera muestra sus roles separados por coma (ver `shell-navegacion`)

#### Scenario: Sin restricción de acciones por rol (comportamiento actual)

- **WHEN** un usuario con rol `CATALOG_EDITOR` usa la aplicación
- **THEN** el front-end no oculta ni bloquea ninguna acción por rol; cualquier restricción depende del backend

## Notas

- El front-end no guarda token en almacenamiento del navegador. Un test (`AuthContext.spec.tsx`) verifica que no se escribe nada en `localStorage`.
- `apps/react-front/src/app/app.spec.tsx` todavía describe un login basado en `localStorage.token`. Ese comportamiento ya no existe; el test está desactualizado (ver `baseline-analysis.md`).
- Pendiente en tests: `it.todo('validates the whoami payload shape')` en `AuthContext.spec.tsx`. No hay validación del payload de `whoami`.
