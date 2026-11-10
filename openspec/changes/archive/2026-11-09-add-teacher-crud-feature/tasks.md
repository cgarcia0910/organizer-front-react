# Tasks

## 1. Generar la lib

- [x] 1.1 Ejecutar `npx nx g @nx/react:library teacher-crud-feature --directory=libs/academic-offer/teacher-crud-feature --importPath=@react-front/teacher-crud-feature --bundler=vite --unitTestRunner=vitest --linter=eslint --tags=feature --style=none --no-interactive`; verificar que se crea `libs/academic-offer/teacher-crud-feature` con `package.json`, `vite.config.mts` y `tsconfig*.json`, y que `nx show projects` la lista
- [x] 1.2 Borrar los archivos de plantilla que genera el generador (`src/lib/teacher-crud-feature.tsx` y su spec) y verificar que `src/` sólo contiene `index.ts` y `lib/`
- [x] 1.3 Ejecutar `npm install` y verificar con `node -p "require.resolve('@react-front/teacher-crud-feature')"` que el paquete resuelve desde el workspace

## 2. Dominio y aplicación

- [x] 2.1 Crear `domain/entities/teacher.ts` con el tipo `Teacher` (`id`, `firstName`, `lastName`, `email`, `status`, `createdAt`, `updatedAt`) y `TeacherStatus = 'ACTIVE' | 'INACTIVE'`; y `domain/entities/page.ts` copiado de `courses-crud-feature`; verificar con `tsc -p tsconfig.lib.json --noEmit` que compilan sin errores
- [x] 2.2 Crear `application/use-cases/get-teacher-page.ts` que llama a `TeachersApiFp(...).listTeachers(page, size, search)` y devuelve `data`; verificar con un test que mockea `TeachersApiFp` y comprueba los argumentos, incluido que `search` no se envía cuando está vacío

## 3. Presentación: listado

- [x] 3.1 Crear `presentation/hooks/data-access/useTeachers.ts` con TanStack Query, clave `['teachers', page, size, search]`; verificar con un test que el hook llama a `getTeacherPage` con esos valores
- [x] 3.2 Crear `presentation/constants/teacher-columns.tsx` con las columnas Nombre, Apellidos, Email y Estado; el chip de estado usa `ACTIVE → "Activo"` (`success`), `INACTIVE → "Inactivo"` (`default`) y muestra el valor crudo si es desconocido; verificar con un test de `getTeacherColumns` que cubre los tres casos
- [x] 3.3 Crear `presentation/components/TeachersHeader.tsx`, `TeachersFilter.tsx` (búsqueda) y `TeachersTable.tsx` (DataGrid con paginación de servidor y mensaje de error); verificar con tests que la búsqueda envía `search` y que un fallo de carga muestra el mensaje de error
- [x] 3.4 Crear `presentation/pages/teachers-page.tsx` que orquesta el estado de paginación y búsqueda, y reinicia la página a 0 al cambiar la búsqueda; verificar con un test de ese reinicio

## 4. Exportación y ruta

- [x] 4.1 Exportar sólo `TeachersPage` desde `src/index.ts`; verificar con `npx tsc -p tsconfig.lib.json --noEmit` que no hay errores nuevos en la lib
- [x] 4.2 En `apps/react-front/src/app/dashboard.tsx`, añadir `<Route path="/academic-offer/teachers" element={<TeachersPage />} />` dentro del bloque `<Route element={<ProtectedRoute />}>` existente, junto a la de cursos; verificar que `npx nx build react-front` pasa

## 5. Verificación final

- [x] 5.1 Ejecutar `npx nx test teacher-crud-feature`, `npx nx lint teacher-crud-feature` y `npx nx build react-front` y verificar que pasan sin errores nuevos
- [x] 5.2 Revisar en `npx nx serve react-front`, contra un back con el contrato 3.0.0: sin sesión, `/academic-offer/teachers` redirige a `/login`; con sesión, el listado carga, la búsqueda filtra y la paginación funciona; verificar qué estados devuelve el servidor por defecto

## Workflow follow-up

- Confirmar la ruta `/academic-offer/teachers` y el comportamiento por defecto del servidor con respecto a los inactivos antes de archivar.
- El enlace del menú lateral "Profesores" sigue sin navegar (baseline item 5); es un cambio aparte.
