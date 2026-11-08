import {
  Configuration,
  CoursesApiFp,
  SubjectsApiFp,
  type UpdateSubjectsRequest,
} from '@cgarcia0910/api-academiccatalog';
import { UpdateCourseCommand } from '../../domain/entities/courses';
import { SubjectWithId } from '../../domain/entities/subject';

const courseApi = CoursesApiFp(new Configuration({ basePath: '/resources' }));
const subjectsApi = SubjectsApiFp(new Configuration({ basePath: '/resources' }));

type SubjectFields = Pick<SubjectWithId, 'code' | 'name' | 'hoursPerWeek' | 'maxHoursPerDay'>;

const fieldsOf = (s: SubjectWithId): SubjectFields => ({
  code: s.code,
  name: s.name,
  hoursPerWeek: s.hoursPerWeek,
  maxHoursPerDay: s.maxHoursPerDay,
});

const sameFields = (a: SubjectFields, b: SubjectFields) =>
  a.code === b.code &&
  a.name === b.name &&
  a.hoursPerWeek === b.hoursPerWeek &&
  a.maxHoursPerDay === b.maxHoursPerDay;

/**
 * Calcula el cuerpo de `updateSubjects` a partir de la lista cargada y la editada:
 * - `new`: asignaturas sin `id`.
 * - `update`: asignaturas con `id` cuyos campos han cambiado.
 * - `delete`: `id` de las asignaturas cargadas que ya no están en la lista editada.
 * Sólo incluye los grupos con contenido. Una asignatura con `id` que no estaba en la
 * lista cargada se ignora: no debería ocurrir, y tratarla como nueva la duplicaría.
 */
export function buildSubjectChanges(
  original: SubjectWithId[],
  current: SubjectWithId[],
): UpdateSubjectsRequest {
  const originalById = new Map(
    original.filter((s) => s.id).map((s) => [s.id as string, s]),
  );
  const currentIds = new Set(current.map((s) => s.id).filter(Boolean));

  const created = current.filter((s) => !s.id).map(fieldsOf);
  const updated = current.flatMap((s) => {
    const previous = s.id ? originalById.get(s.id) : undefined;
    return previous && !sameFields(fieldsOf(s), fieldsOf(previous))
      ? [{ id: s.id, ...fieldsOf(s) }]
      : [];
  });
  const deleted = original
    .filter((s) => s.id && !currentIds.has(s.id))
    .map((s) => s.id as string);

  const changes: UpdateSubjectsRequest = {};
  if (created.length > 0) changes.new = created;
  if (updated.length > 0) changes.update = updated;
  if (deleted.length > 0) changes.delete = deleted;
  return changes;
}

export async function updateCourse(command: UpdateCourseCommand) {
  const { originalSubjects, ...course } = command;
  const changes = buildSubjectChanges(originalSubjects, course.subjects);

  if (Object.keys(changes).length > 0) {
    const subjectRequest = await subjectsApi.updateSubjects(course.id, changes);
    await subjectRequest();
  }

  const request = await courseApi.updateCourse(course.id, course);
  return (await request()).data;
}
