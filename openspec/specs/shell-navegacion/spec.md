# Shell y navegación Specification

## Purpose

Describe la estructura visual y de enrutado de la aplicación una vez el usuario tiene sesión: cabecera, menú lateral, área de contenido y reglas de redirección. Implementado en `apps/react-front` (`app/app.tsx`, `app/dashboard.tsx`, `components/LoginAppBar.tsx`, `components/SidebarMenu.tsx`) y en `main.tsx`.

## Requirements

### Requirement: Arranque y proveedores

El sistema SHALL montar la aplicación envuelta en `StrictMode`, `BrowserRouter`, `AuthProvider` y `QueryClientProvider`, en ese orden, con `CssBaseline` de MUI.

#### Scenario: Arranque de la aplicación

- **WHEN** se carga la aplicación en el navegador
- **THEN** se renderiza `App` dentro de los proveedores de routing, autenticación y consultas

### Requirement: Rutas de nivel superior

El sistema SHALL exponer `/login` como página pública y SHALL envolver `/*` en `ProtectedRoute` para renderizar el `Dashboard`.

#### Scenario: Ruta pública

- **WHEN** el usuario accede a `/login`
- **THEN** se renderiza `LoginFeature` sin el layout principal

#### Scenario: Ruta protegida

- **WHEN** el usuario accede a cualquier otra ruta
- **THEN** se aplica `ProtectedRoute` y, si hay sesión, se renderiza el `Dashboard`

### Requirement: Redirección por defecto dentro del dashboard

El sistema SHALL redirigir cualquier ruta no reconocida dentro del dashboard a `/academic-offer/courses`. Tras un login correcto, el usuario llega a `/`, que cae en esa misma redirección.

#### Scenario: Ruta desconocida

- **WHEN** un usuario autenticado accede a `/cualquier/cosa`
- **THEN** es redirigido a `/academic-offer/courses` con reemplazo en el historial

#### Scenario: Entrada tras login

- **WHEN** el login termina correctamente
- **THEN** el usuario llega a `/` y, desde ahí, a `/academic-offer/courses`

### Requirement: Cabecera de la aplicación

El sistema SHALL mostrar una barra superior fija con el nombre "Campus Admin", el email del usuario, sus roles separados por coma, un avatar con sus iniciales y un botón de menú de usuario.

#### Scenario: Iniciales del avatar

- **WHEN** hay un usuario autenticado
- **THEN** el avatar muestra la primera letra de hasta dos palabras del email, en mayúsculas
- **AND** para un email sin espacios (la situación normal) se muestra una sola letra

#### Scenario: Menú de usuario

- **WHEN** el usuario pulsa el avatar
- **THEN** se abre un menú con la opción "Cerrar sesión"
- **AND** la opción "Mi perfil" está comentada en el código y no aparece

#### Scenario: Botón de menú en móvil

- **WHEN** la pantalla es menor que `md` y el usuario pulsa el icono de menú
- **THEN** se abre el menú lateral como cajón temporal

### Requirement: Menú lateral

El sistema SHALL mostrar un menú lateral con las secciones "Dashboard", "Oferta académica" (con subelementos "Cursos" y "Profesores") y "Configuración". En escritorio (`md` o superior) el menú es permanente; en móvil es un cajón temporal que se cierra al seleccionar una opción.

#### Scenario: Secciones visibles

- **WHEN** el dashboard está renderizado
- **THEN** el menú muestra Dashboard, Oferta académica (desplegado por defecto), Cursos, Profesores y Configuración

#### Scenario: Selección de elemento (comportamiento actual)

- **WHEN** el usuario selecciona un elemento del menú
- **THEN** el elemento queda resaltado y el menú móvil se cierra
- **BUT** la URL no cambia y no se navega a ninguna página nueva; el contenido sigue siendo el de cursos

#### Scenario: Elemento sin página

- **WHEN** el usuario selecciona "Profesores", "Configuración" o "Dashboard"
- **THEN** no hay ninguna página asociada; el contenido principal no cambia

#### Scenario: Colapso de Oferta académica

- **WHEN** el usuario pulsa "Oferta académica"
- **THEN** se alterna la visibilidad de sus subelementos

### Requirement: Área de contenido principal

El sistema SHALL renderizar el contenido de la ruta dentro de un `Paper` con fondo `#F5F7FA` y borde, desplazado 64 px por la barra superior. La única ruta con contenido es `/academic-offer/courses`, que renderiza `CoursesPage`.

#### Scenario: Ruta de cursos

- **WHEN** el usuario accede a `/academic-offer/courses`
- **THEN** se renderiza `CoursesPage` dentro del área principal

## Notas

- La selección del menú es estado local (`activeSection`, por defecto `'Cursos'`). No está sincronizada con la URL, así que al recargar siempre se resalta "Cursos".
- `SidebarMenu` tiene una prop `mobileOpen` y `setMobileOpen` compartidas con `LoginAppBar`; el estado vive en `Dashboard`.
- El código contiene un `handleProfile` que no se usa y un import sin usar (`AccountCircleIcon`); no tiene efecto funcional.
