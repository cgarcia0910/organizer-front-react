# Design

## Context

Estado verificado en el repositorio:

- `libs/academic-offer/courses-crud-feature` es la referencia de estructura: `src/lib/domain/entities`, `src/lib/application/use-cases`, `src/lib/presentation/{pages,components,constants,hooks/data-access}`, y un `src/index.ts` que exporta sólo la página. Su `package.json` declara `nx.tags: ["feature"]` y `main`/`exports` apuntan a `src/index.ts`.
- Las libs de `libs/academic-offer/*` son workspaces de npm (`package.json` raíz). Una lib nueva se enlaza con `npm install`.
- `apps/react-front/src/app/dashboard.tsx` define las rutas de contenido dentro de `<Route element={<ProtectedRoute />}>`. La ruta de cursos está ahí, y la de profesores irá en el mismo bloque.
- El cliente 3.0.0 expone `TeachersApiFp(configuration).listTeachers(page?, size?, search?, status?, sort?, direction?)` y el modelo `Teacher` (`id`, `firstName`, `lastName`, `email`, `status`, `createdAt`, `updatedAt`). No tiene `includeInactive`: el filtro de estado es `status` y, sin él, el servidor decide.

Ver proposal.md para el motivo y el alcance.

## Goals / Non-Goals

**Goals:**
- Replicar la estructura de capas de `courses-crud-feature` en la feature de profesores, con los mismos nombres de carpeta y el mismo reparto de responsabilidades.
- Crear la lib con el generador de Nx para que la configuración (`project`, `tags`, `tsconfig`, `vite`, `vitest`, `eslint`) sea la de las demás libs del repo.
- Mostrar el listado con la misma restricción de acceso que cursos.

**Non-Goals:**
- Mutaciones (crear, editar, eliminar).
- Filtro de estado y ordenación en la interfaz, aunque la API los admite.
- Enlazar el ítem "Profesores" del menú lateral.

## Decisions

### 1. Generar la lib con `@nx/react:library` y limpiar la plantilla

Se ejecuta el generador con los mismos parámetros que la lib de cursos (directorio `libs/academic-offer/teacher-crud-feature`, `importPath` `@react-front/teacher-crud-feature`, `bundler` vite, `unitTestRunner` vitest, `linter` eslint, tag `feature`). El generador crea un `src/lib/teacher-crud-feature.tsx` de plantilla y su spec: se borran, y se crea en su lugar la estructura de capas.

*Alternativa considerada*: copiar la carpeta de cursos y renombrar. Se descarta: copia la configuración de cursos con sus particularidades (por ejemplo, el `cacheDir` de vite) sin pasar por el generador, y la lib nueva quedaría fuera de la convención de Nx.

### 2. Capas idénticas a cursos

| Carpeta | Contenido |
|---|---|
| `domain/entities/teacher.ts` | Tipo `Teacher` propio (no el tipo de la API) y `TeacherStatus` local. |
| `domain/entities/page.ts` | Copia de `Page<T>` de cursos. |
| `application/use-cases/get-teacher-page.ts` | Llama a `TeachersApiFp.listTeachers` con `page`, `size` y `search`. Mismo patrón que `get-course-page.ts`. |
| `presentation/hooks/data-access/useTeachers.ts` | Hook TanStack Query, igual que `useCourses`, con clave `['teachers', ...]`. |
| `presentation/constants/teacher-columns.tsx` | Definición de columnas del DataGrid, como `course-columns.tsx`. |
| `presentation/components/TeachersHeader.tsx`, `TeachersFilter.tsx`, `TeachersTable.tsx` | Componentes visuales, paralelos a los de cursos. |
| `presentation/pages/teachers-page.tsx` | Página contenedora que orquesta estado y hooks. |
| `index.ts` | Exporta sólo `TeachersPage`. |

*Decisión*: el tipo `Page<T>` se **copia**, no se comparte. No existe una lib común y crearla ahora ampliaría el alcance. Si aparece una tercera feature con el mismo tipo, se extrae entonces.

### 3. Listado sin `includeInactive`

El listado de cursos pide `includeInactive=true` siempre. `listTeachers` no tiene ese parámetro, así que el listado de profesores llama sin `status`: el servidor devuelve lo que decide por defecto. Si el back excluye los inactivos por defecto, el listado sólo mostrará activos; se confirma en la revisión manual.

*Alternativa considerada*: pedir los dos estados en dos llamadas y unirlas. Se descarta: rompe la paginación del servidor.

### 4. Ruta y restricciones

La ruta `/academic-offer/teachers` se añade en `dashboard.tsx` dentro del bloque `<Route element={<ProtectedRoute />}>` existente, al lado de la de cursos. Así hereda exactamente la misma restricción, sin duplicar la lógica de `ProtectedRoute`.

### 5. Nombre de capacidad

`oferta-academica-profesores`, por el mismo criterio que `oferta-academica-cursos` (dominio `oferta-academica` + entidad). Es un nombre nuevo, sin solapamiento con capacidades existentes.

## Risks / Trade-offs

- **[Plantilla del generador]** `@nx/react:library` genera archivos que hay que borrar a mano. → Mitigación: la tarea de generación incluye verificar que sólo quedan los archivos de la estructura de capas.
- **[Duplicación de `Page<T>`]** Dos copias del mismo tipo. → Aceptable mientras sean dos features; se extrae cuando haya una tercera.
- **[Filtro por defecto del servidor]** Si el back devuelve sólo activos por defecto, el listado oculta inactivos sin que la interfaz lo indique. → Mitigación: se verifica en la revisión manual; si hace falta, se añade un filtro de estado en un cambio posterior.
- **[Ruta sin enlace de menú]** Llegar a `/academic-offer/teachers` requiere escribir la URL, porque el ítem del menú no navega. → Riesgo conocido y aceptado: el enlace es el baseline item 5, fuera de este cambio.
- **[Dependencia de workspace]** Sin `npm install`, `@react-front/teacher-crud-feature` no resuelve y la app no compila. → Incluido en las tareas.

## Migration Plan

Sin migración de datos. Se añade una lib nueva y una ruta; no se modifica ningún comportamiento existente. Rollback: borrar la lib, quitar la ruta de `dashboard.tsx` y ejecutar `npm install` para retirar el enlace del workspace.

## Open Questions

Ninguna que bloquee el plan. Dos supuestos quedan registrados para confirmar en la revisión:
- La ruta es `/academic-offer/teachers`. Si prefieres otra, sólo cambia `dashboard.tsx` y la spec.
- Sin filtro de estado, el listado muestra lo que devuelve el servidor por defecto.
