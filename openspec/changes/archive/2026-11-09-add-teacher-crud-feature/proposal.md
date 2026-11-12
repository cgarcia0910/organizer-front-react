# Proposal

## Why

El menú lateral ya tiene una sección "Profesores", pero no existe ninguna funcionalidad detrás. El cliente generado `@cgarcia0910/api-academiccatalog` (3.0.0) ya expone `TeachersApiFp.listTeachers`, así que el front puede mostrar el listado de profesores sin esperar al back.

Se hace como una feature nueva, paralela a `courses-crud-feature`, para que la estructura de carpetas y la separación en capas (domain, application, presentation) sean las mismas en ambas y no haya que aprender dos organizaciones distintas.

## What Changes

- Crear la librería `libs/academic-offer/teacher-crud-feature` (`@react-front/teacher-crud-feature`) con el generador de Nx `@nx/react:library`, y sustituir el código de plantilla que genera por la estructura de `courses-crud-feature`.
- Dentro de la feature, una página de listado de profesores que:
  - pide los profesores paginados al servidor con `TeachersApiFp.listTeachers`;
  - ofrece búsqueda por texto (`search`), igual que el listado de cursos;
  - muestra nombre, apellidos, email y estado (`ACTIVE` / `INACTIVE`, con etiqueta en castellano).
- Añadir la ruta `/academic-offer/teachers` en `apps/react-front/src/app/dashboard.tsx` dentro del mismo `ProtectedRoute` que la ruta de cursos, para que tenga las mismas restricciones de acceso.

Fuera de alcance:
- Crear, editar o eliminar profesores (sólo listado).
- Navegar desde el menú lateral: el ítem "Profesores" no tiene enlace hoy y sigue igual (baseline, item 5).
- Filtro por estado y ordenación desde la interfaz (la API lo permite; se deja para un cambio posterior).
- Pantalla de asignaturas por profesor (`listTeachersForSubject`).

## Capabilities

### New Capabilities

- `oferta-academica-profesores`: listado paginado y búsqueda de profesores del catálogo académico, con su ruta protegida. Nombrada igual que `oferta-academica-cursos` para mantener la organización por dominio.

### Modified Capabilities

Ninguna.

## Impact

- **Código nuevo**: `libs/academic-offer/teacher-crud-feature/` (estructura espejo de `courses-crud-feature`).
- **Código modificado**: `apps/react-front/src/app/dashboard.tsx` (una ruta nueva dentro del `ProtectedRoute` existente).
- **Dependencias**: ninguna nueva. La librería queda enlazada por npm workspaces (`libs/academic-offer/*`), por lo que hace falta un `npm install` para que `@react-front/teacher-crud-feature` resuelva.
- **API**: sólo `listTeachers`. No cambia el cliente ni la versión.
- **Tests**: listado, búsqueda, estado y la ruta protegida de profesores, siguiendo el patrón de los tests de cursos.
