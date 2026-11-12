# Proposal

## Why

El análisis de línea base (`openspec/baseline-analysis.md`) y la especificación `oferta-academica-cursos` documentan cuatro errores de alta prioridad en el catálogo de cursos que hoy producen comportamiento incorrecto o engañoso:

- El listado muestra columnas (`modality`, `duration`) que no existen en el modelo `Course` de la API, y el chip de estado compara con "Activo"/"Borrador" mientras la API devuelve `ACTIVE`/`INACTIVE`.
- El código de asignatura que introduce el usuario se descarta: `create-course.ts` y `update-course.ts` sustituyen `code` por `name`. La API sí acepta `code` en `SubjectCreate` y `SubjectPatch`.
- Un fallo al guardar un curso no se comunica: el panel se cierra antes de la respuesta y no hay `onError`.
- Un fallo al cargar las asignaturas para editar no produce ningún mensaje visible.

Se corrigen juntos porque afectan a los mismos archivos del módulo de cursos y a los mismos requisitos de la especificación.

## What Changes

- **Listado**: sustituir el mapeo de estado por `ACTIVE`/`INACTIVE` (etiquetas en castellano y color por estado) y eliminar las columnas Modalidad y Duración, que no tienen campo en la API. **BREAKING** para la interfaz: desaparecen dos columnas que nunca mostraron datos.
- **Código de asignatura**: enviar `code` tal como lo introduce el usuario en `createCourse` y `updateCourse`, en lugar de copiar `name`.
- **Errores al guardar**: el panel de creación o edición permanece abierto hasta recibir la respuesta. Si la mutación falla, se muestra un mensaje de error visible al usuario y los datos del formulario se conservan.
- **Errores al abrir edición**: si falla la carga de asignaturas, se muestra un mensaje de error visible y el panel no se abre con datos incompletos.
- **Actualización de la especificación**: los requisitos afectados de `oferta-academica-cursos` se reemplazan con `MODIFIED` y se eliminan las anotaciones *(comportamiento actual)* / *(incompleto)* de los escenarios corregidos.

Fuera de alcance (se tratan en cambios separados):
- Filtro de estado sin efecto y ordenación del servidor (baseline items 8-9).
- Navegación del menú lateral y páginas de Profesores, Configuración y Dashboard (item 5).
- Tests desactualizados de `app.spec.tsx` y E2E de plantilla (items 6-7).
- Eliminación de cursos (sigue sin implementar).
- Error del listado (`isError` no leído): no está entre los cuatro puntos de alta prioridad.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `oferta-academica-cursos`: cambian los requisitos de columnas del listado, de estado del curso, de envío de asignaturas en creación y edición, de manejo de errores al guardar y al cargar asignaturas para editar.

## Impact

- **Código**:
  - `libs/academic-offer/courses-crud-feature/src/lib/presentation/constants/course-columns.tsx` (columnas y mapeo de estado).
  - `libs/academic-offer/courses-crud-feature/src/lib/application/use-cases/create-course.ts` y `update-course.ts` (campo `code`).
  - `libs/academic-offer/courses-crud-feature/src/lib/presentation/components/NewEditCourseForm.tsx` y `pages/courses-page.tsx` (cierre del panel y mensajes de error).
  - `libs/academic-offer/courses-crud-feature/src/lib/presentation/hooks/data-access/useCreateCourse.ts` y `useUpdateCourse.ts` (estado de error de la mutación).
- **API**: sin cambios en el backend ni en el cliente generado `@cgarcia0910/api-academiccatalog` 2.0.0; solo se usan campos que ya existen.
- **Tests**: los tests de `courses-crud-feature` que cubran columnas, estado o envío de asignaturas deben actualizarse.
- **Especificación**: `openspec/specs/oferta-academica-cursos/spec.md` se modifica al archivar el cambio.
