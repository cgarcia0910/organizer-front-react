# Instrucciones de OpenSpec para asistentes

Estas instrucciones son para cualquier asistente de código que trabaje en este repositorio.

## Antes de cambiar comportamiento

1. Lee `openspec/project.md` para el contexto, el stack y las convenciones.
2. Lee la spec del dominio afectado en `openspec/specs/<dominio>/spec.md`:
   - `autenticacion` — login, sesión, rutas protegidas, logout.
   - `shell-navegacion` — cabecera, menú lateral, rutas de nivel superior.
   - `oferta-academica-cursos` — listado, búsqueda, creación y edición de cursos.
3. Revisa `openspec/baseline-analysis.md` para saber qué está incompleto antes de asumir que una función funciona.

## Cuándo crear un *change*

Crea un change en `openspec/changes/<id-kebab-case>/` cuando la petición:

- añada una funcionalidad nueva;
- cambie el comportamiento descrito en una spec;
- corrija algo marcado como *(incompleto)* o *(comportamiento actual)* en una spec.

Un change contiene:

- `proposal.md` — qué y por qué.
- `tasks.md` — lista de tareas marcables.
- `specs/<dominio>/spec.md` — deltas con `## ADDED Requirements`, `## MODIFIED Requirements` o `## REMOVED Requirements`. Los `MODIFIED` deben incluir el requisito completo, no solo lo que cambia.

Cuando el change esté implementado y aprobado, se archiva en `openspec/changes/archive/` y su delta se fusiona en `openspec/specs/`.

No hace falta un change para cambios sin impacto de comportamiento: refactors internos, formato, o ajustes de tests que no cambian lo que el usuario ve.

## Formato de requisitos

Cada requisito usa `### Requirement:` con `SHALL` o `MUST` en el texto, y al menos un escenario con `#### Scenario:`:

```markdown
### Requirement: Nombre del requisito

El sistema SHALL ...

#### Scenario: Nombre del escenario

- **WHEN** ...
- **THEN** ...
- **AND** ...
```

## Reglas del repositorio

- No inventes funcionalidades que el código no tiene. Si algo está previsto pero no existe, indícalo como *(incompleto)* o como nota, no como requisito.
- Respeta la arquitectura existente: no reestructures carpetas ni migres librerías sin un change aprobado.
- Los textos de la interfaz siguen el idioma de la sección que modifican (ver `project.md`).
