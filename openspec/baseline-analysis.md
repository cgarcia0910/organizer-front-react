# Análisis de línea base

Fecha: 2026-11-06. Rama: `feature/openspect`. Alcance: lectura del repositorio, ejecución de tests y de typecheck. **No se ha modificado código de la aplicación.**

## 1. Arquitectura y estructura

Monorepo Nx con workspaces de npm. Tres proyectos de código:

| Proyecto | Ruta | Paquete | Rol |
|---|---|---|---|
| react-front | `apps/react-front` | `@react-front/react-front` | Shell: rutas, layout, cabecera, menú |
| login-feature | `libs/auth/login-feature` | `@react-front/login-feature` | Autenticación y rutas protegidas |
| courses-crud-feature | `libs/academic-offer/courses-crud-feature` | `@react-front/courses-crud-feature` | Catálogo de cursos |
| react-front-e2e | `apps/react-front-e2e` | — | Playwright (plantilla sin casos reales) |

Las librerías no tienen paso de build propio: `main` y `exports` apuntan a `src/index.ts`. El `dist/` de `login-feature` existe en disco pero está ignorado por git y contiene tipos antiguos (incluye `token`, que ya no existe en `src/`).

Dependencias de runtime relevantes: React 19, MUI 9, TanStack Query 5, react-hook-form 7, zod 4, react-router-dom 6.30.3 y el cliente generado `@cgarcia0910/api-academiccatalog` 2.0.0. El backend no está en el repositorio.

No hay CI (ni `.github/`), no hay `CLAUDE.md`, y `README.md` es la plantilla de Nx.

## 2. Funcionalidades implementadas

### Autenticación (`login-feature`) — implementado y cubierto por tests

- Login con email y contraseña, validación con zod, mensajes de error por caso (401, error de servidor, red).
- Restauración de sesión al cargar con `GET /api/auth/whoami`.
- Rutas protegidas con redirección a `/login` y conservación de la ruta de origen.
- Logout con `POST /api/auth/logout`, que limpia el usuario aunque falle.
- Sin almacenamiento en `localStorage`; la sesión va por cookie del backend.

### Shell (`apps/react-front`) — implementado

- Cabecera fija con nombre, email, roles, avatar y menú "Cerrar sesión".
- Menú lateral permanente en escritorio y cajón en móvil.
- Redirección de rutas desconocidas a `/academic-offer/courses`.

### Cursos (`courses-crud-feature`) — listado, búsqueda, creación y edición

- Listado paginado del servidor con búsqueda por texto.
- Creación de curso con asignaturas (formulario con validación).
- Edición de curso con carga previa de sus asignaturas.

## 3. Funcionalidades incompletas o inconsistentes

Verificadas leyendo el código y comparándolo con el cliente generado de la API.

### Alta prioridad (comportamiento incorrecto o engañoso)

1. **Columnas y estados no coinciden con la API.** `course-columns.tsx` usa `modality` y `duration`, que no existen en `Course`. El chip de estado compara con `'Activo'`/`'Borrador'`, pero la API devuelve `ACTIVE`/`INACTIVE`, así que el chip siempre usa color por defecto y muestra el valor en inglés.
2. **El código de asignatura introducido por el usuario se descarta.** `create-course.ts` y `update-course.ts` hacen `code: sb.name`. El campo "Codigo de la asignatura" del formulario no tiene efecto.
3. **Errores de guardado silenciosos.** El formulario cierra el panel antes de que termine la mutación y no hay `onError`. Un fallo no se comunica al usuario.
4. **Fallo al abrir edición silencioso.** `onEdit` no tiene `catch`; si falla la carga de asignaturas, no pasa nada visible.
5. **Menú lateral sin navegación.** `SidebarMenu` solo cambia estado local. La URL no cambia, y "Profesores", "Configuración" y "Dashboard" no tienen página. "Cursos" siempre aparece seleccionado al cargar.
6. **Tests desactualizados en la app.** `apps/react-front/src/app/app.spec.tsx` falla (2 de 3 tests). Espera un login basado en `localStorage.token`, que ya no existe, y hace `vi.mock('./nx-welcome')` de un módulo que no existe. El test ni siquiera llega a "Sign in": se queda en "Cargando..." porque `whoami` no está mockeado.
7. **E2E de plantilla.** `apps/react-front-e2e/src/example.spec.ts` busca un `h1` con "Welcome" en `/`. No se ha ejecutado en este análisis.

### Media prioridad (funciones visibles sin efecto)

8. **Filtro de estado sin efecto.** Se guarda en `CoursesPage` y no se envía a `useCourses`.
9. **Ordenación sin efecto.** `sortingMode="server"` sin `onSortModelChange`.
10. **Eliminar es un `console.log`.** Ver `onDelete` en `courses-page.tsx`.
11. **Búsqueda no reinicia la página.** Al cambiar el texto, la página actual se mantiene.
12. **Sin estados de error de carga.** `useCourses` no expone `isError`.

### Código muerto o roto

13. **`CoursesSummary.tsx` no compila.** Usa `courses` y `totalRows` sin definir. No se importa en ningún sitio, así que Vite no lo llega a procesar.
14. **Typecheck de `courses-crud-feature` con errores.** `npx tsc -p tsconfig.lib.json --noEmit` reporta, entre otros: `CoursesFilters.tsx` (acceso a `value` en `EventTarget`), `CoursesHeader.tsx`, `CoursesTable.tsx` y `CoursesSummary.tsx` (prop `fontWeight` en `Typography`, que MUI 9 no acepta así), `NewEditCourseForm.tsx` (tipo de `register` para `subjects.N`) y `update-course.ts` (import `Course` sin usar). Vite no hace typecheck, así que la aplicación se sirve igualmente.
15. **Typecheck de la app.** `apps/react-front/tsconfig.app.json` reporta errores de referencias de proyecto (TS6305, dist no construido) y, en `LoginAppBar.tsx`, `user` no existe en `AuthContextType`. Este último error viene del `dist/` desactualizado de `login-feature`.
16. **Código no usado.** `handleProfile`, `AccountCircleIcon` en `LoginAppBar.tsx`, `courseSchema` exportado sin uso externo, y el bloque comentado de `CoursesPageProps`.
17. **Sin validación de roles en el front.** `CATALOG_ADMIN` y `CATALOG_EDITOR` solo se muestran en la cabecera.

### Funciones de la API sin interfaz

- Activar/desactivar curso (`POST /courses/{id}/activation`, `reactivateCourse`) y asignaturas (`/subjects/{id}/activation`). La reactivación es exclusiva de `CATALOG_ADMIN`.
- Eliminar/desactivar asignaturas individuales (`DELETE /courses/{id}/subjects/{subjectId}`).
- Profesores completos: habilitaciones de profesor por asignatura, `/teachers`, `/teachers/me`. No hay ninguna pantalla de profesores.

## 4. Resultados de verificación

Ejecutados sin modificar nada:

- `npx vitest run` desde la raíz: **5 ficheros, 35 tests pasan, 2 fallan, 1 `todo`.** Los dos fallos están en `apps/react-front/src/app/app.spec.tsx` (ver punto 6). Los 4 ficheros de `login-feature` pasan.
- `npx tsc -p libs/academic-offer/courses-crud-feature/tsconfig.lib.json --noEmit`: errores listados en el punto 14.
- `npx tsc -p apps/react-front/tsconfig.app.json --noEmit`: errores listados en el punto 15.

No se ha ejecutado el build de Nx, ni el servidor de desarrollo, ni Playwright.

## 5. Convenciones detectadas

Ver `openspec/project.md`, sección "Convenciones de código". Resumen: idioma mixto (login en inglés, resto en castellano), capas explícitas solo en `courses-crud-feature`, estilo MUI con `sx`, Prettier con comillas simples, tests junto al código con Vitest.

## 6. Decisiones de esta línea base

- Las specs describen el **comportamiento actual**. Donde el código es incompleto, el escenario lo marca como *(comportamiento actual)* o *(incompleto)* en lugar de describir el objetivo.
- No se ha especificado ninguna funcionalidad que no exista en el código (por ejemplo, profesores o configuración).
- Las specs están en castellano, igual que la mayor parte de la interfaz. Las palabras clave `SHALL`/`MUST` se mantienen en inglés porque el formato de OpenSpec las usa para validar requisitos.
- Se han creado tres dominios: `autenticacion`, `shell-navegacion` y `oferta-academica-cursos`. No hay dominio de profesores ni de configuración porque no existen en el código.
- No se ha creado `CLAUDE.md` ni se ha modificado ningún fichero fuera de `openspec/`.

## 7. Siguientes pasos sugeridos (no ejecutados)

1. Decidir si los puntos 1–5 se tratan como primeros *changes* de OpenSpec (por ejemplo, "corregir mapeo de estados y columnas").
2. Corregir o eliminar `app.spec.tsx` y el `e2e` de plantilla, para que la suite sea verde.
3. Eliminar `CoursesSummary.tsx` o terminarlo, para que la lib compile.
4. Añadir un puntero a `openspec/AGENTS.md` desde un `CLAUDE.md` o `AGENTS.md` en la raíz, si se quiere que los asistentes lo lean automáticamente.
