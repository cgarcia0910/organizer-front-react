# Project Context

## Propósito

Front-end de **Campus Admin**, una aplicación de administración académica. Hoy cubre la autenticación y la gestión del catálogo de cursos (oferta académica). El resto de secciones del menú (Dashboard, Profesores, Configuración) están en el menú pero sin funcionalidad.

Esta línea base describe el **comportamiento real del código**, no un diseño objetivo. Ver `openspec/baseline-analysis.md` para el detalle de lo implementado y lo incompleto.

## Stack tecnológico

- **Monorepo**: Nx 24 con workspaces de npm (`apps/*`, `libs/auth/*`, `libs/academic-offer/*`).
- **Lenguaje**: TypeScript (`strict`), JSX en `.tsx`.
- **UI**: React 19, MUI 9 (`@mui/material`, `@mui/icons-material`, `@mui/x-data-grid`), Emotion, SCSS (`sass`) para estilos globales.
- **Routing**: `react-router-dom` 6.30.
- **Estado de servidor**: `@tanstack/react-query` 5.
- **Formularios y validación**: `react-hook-form` 7 + `zod` 4 con `@hookform/resolvers`.
- **Cliente HTTP generado**: `@cgarcia0910/api-academiccatalog` 2.0.0 (cliente OpenAPI generado, basado en axios; dependencia externa, no está en este repo).
- **Build y dev server**: Vite 8 con `@vitejs/plugin-react`.
- **Tests**: Vitest 5 + jsdom + Testing Library. E2E con Playwright (`apps/react-front-e2e`).
- **Lint/format**: ESLint 9 (flat config, `@nx/eslint-plugin`), Prettier 3 (`singleQuote: true`).

## Arquitectura

Monorepo con una aplicación shell y librerías de dominio. Las librerías se consumen por nombre de paquete (`@react-front/*`) a través de los workspaces de npm; `main`/`exports` apuntan a `src/index.ts` (sin paso de build por librería).

```
apps/
  react-front/              Shell: arranque, rutas, layout (header, menú lateral, dashboard)
  react-front-e2e/          Tests Playwright (plantilla, sin casos reales)
libs/
  auth/login-feature/       @react-front/login-feature
                            Login, AuthContext, ProtectedRoute, cliente de auth
  academic-offer/
    courses-crud-feature/   @react-front/courses-crud-feature
                            Listado, creación y edición de cursos y sus asignaturas
```

### Capas (solo dentro de `courses-crud-feature`)

Es la única librería con capas explícitas, y es la convención a respetar:

- `src/lib/domain/entities/` — tipos de dominio (`Course`, `Subject`, `Page<T>`, `CreateCourse`, `UpdateCourse`).
- `src/lib/application/use-cases/` — funciones que llaman al cliente generado (`getCoursePage`, `createCourse`, `updateCourse`, `getCourseSubjects`).
- `src/lib/presentation/`
  - `pages/` — página contenedora (`CoursesPage`), que orquesta estado y hooks.
  - `hooks/data-access/` — hooks de TanStack Query (`useCourses`, `useCreateCourse`, `useUpdateCourse`).
  - `components/` — componentes visuales (tabla, filtros, cabecera, formulario).
  - `constants/` — definición de columnas del DataGrid.

La librería `login-feature` usa una estructura más plana: `data-access/auth.api.ts` (llamadas `fetch`), `context/AuthContext.tsx` (estado de sesión), `components/` (`ProtectedRoute`, `AuthLayout`), y `login-feature.tsx` / `login.schema.ts` para el formulario.

## Comunicación con el backend

- El backend no está en este repositorio.
- En desarrollo, Vite (`apps/react-front/vite.config.mts`) hace proxy de:
  - `/api/*` → backend (autenticación, `/api/auth/login|whoami|logout`).
  - `/resources/*` → backend, reescribiendo el prefijo `/resources` (cliente de catálogo académico).
- El destino del proxy está fijado a una IP de WSL (`172.23.96.1:8080`) en `vite.config.mts`. Es configuración de entorno de desarrollo, no un requisito funcional.
- La sesión se gestiona con una **cookie** del backend. El front no guarda tokens en `localStorage` ni en `sessionStorage`.

## Convenciones de código

- **Idioma**: la interfaz mezcla castellano y inglés. Las librerías de cursos y el shell usan **castellano** en textos de UI y comentarios. El login y sus validaciones usan **inglés**. Los nuevos textos de UI deben seguir la sección que modifican.
- **Nombres de archivos**: `kebab-case` para casos de uso y hooks (`create-course.ts`, `useCourses.ts` es excepción en camelCase), `PascalCase.tsx` para componentes. Se mezclan `kebab-case` y `camelCase` en carpetas de `presentation/`; no hay una regla única.
- **Exports**: cada librería expone su API pública solo desde `src/index.ts`.
- **Estilos**: estilos inline con `sx` de MUI. `styles.scss` global y `*.module.scss` en la app.
- **Formato**: 2 espacios, LF, `singleQuote` (`.editorconfig`, `.prettierrc`).
- **Tests**: `*.spec.ts(x)` junto al código fuente. Se mockean módulos con `vi.mock` y hooks de contexto.
- **Límites entre módulos**: ESLint aplica `@nx/enforce-module-boundaries` con `depConstraints` sin restricciones (`*` → `*`).

## Comandos

```sh
npx nx serve react-front          # dev server en http://localhost:4200
npx nx build react-front          # build de producción
npx vitest run                     # todos los tests (desde la raíz)
npx nx test <proyecto>             # tests de una librería
npx nx lint <proyecto>
npx nx format:check
```

## Notas para quien proponga cambios

- Este documento describe el estado actual. Cualquier cambio de comportamiento debe proponerse como un *change* de OpenSpec.
- `libs/auth/login-feature/project.json` tiene `targets: {}`, y `courses-crud-feature` no tiene `project.json`. Los targets se infieren de los plugins de `nx.json`; antes de asumir qué targets existen, ejecuta `npx nx show project <nombre>`.
