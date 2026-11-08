import { describe, expect, it, vi, beforeEach } from 'vitest';

import { buildSubjectChanges, updateCourse } from './update-course';
import type { UpdateCourseCommand } from '../../domain/entities/courses';
import type { SubjectWithId } from '../../domain/entities/subject';

const { updateCourseMock, updateSubjectsMock } = vi.hoisted(() => ({
  updateCourseMock: vi.fn(),
  updateSubjectsMock: vi.fn(),
}));

vi.mock('@cgarcia0910/api-academiccatalog', () => ({
  Configuration: vi.fn(),
  CoursesApiFp: vi.fn(() => ({ updateCourse: updateCourseMock })),
  SubjectsApiFp: vi.fn(() => ({ updateSubjects: updateSubjectsMock })),
}));

const alg: SubjectWithId = { id: 'subj-1', code: 'ALG', name: 'Álgebra', hoursPerWeek: 4, maxHoursPerDay: 2 };
const geo: SubjectWithId = { id: 'subj-2', code: 'GEO', name: 'Geometría', hoursPerWeek: 3, maxHoursPerDay: 1 };
const fis = { code: 'FIS', name: 'Física', hoursPerWeek: 2, maxHoursPerDay: 1 };

describe('buildSubjectChanges', () => {
  it('devuelve un objeto vacío si no hay cambios', () => {
    expect(buildSubjectChanges([alg, geo], [{ ...alg }, { ...geo }])).toEqual({});
  });

  it('envía en new las asignaturas sin id, con sus cuatro campos', () => {
    expect(buildSubjectChanges([alg], [alg, fis])).toEqual({ new: [fis] });
  });

  it('envía en update sólo las existentes cuyos campos cambian, con su id y los cuatro campos', () => {
    const cambiada = { ...geo, hoursPerWeek: 5 };

    expect(buildSubjectChanges([alg, geo], [alg, cambiada])).toEqual({
      update: [{ id: 'subj-2', code: 'GEO', name: 'Geometría', hoursPerWeek: 5, maxHoursPerDay: 1 }],
    });
  });

  it('envía en delete los ids de las asignaturas quitadas', () => {
    expect(buildSubjectChanges([alg, geo], [alg])).toEqual({ delete: ['subj-2'] });
  });

  it('combina new, update y delete en una sola estructura', () => {
    const cambiada = { ...alg, name: 'Álgebra lineal' };

    expect(buildSubjectChanges([alg, geo], [cambiada, fis])).toEqual({
      new: [fis],
      update: [{ id: 'subj-1', code: 'ALG', name: 'Álgebra lineal', hoursPerWeek: 4, maxHoursPerDay: 2 }],
      delete: ['subj-2'],
    });
  });

  it('ignora una asignatura con id que no estaba en la lista cargada', () => {
    const desconocida = { id: 'subj-x', code: 'XXX', name: 'Desconocida', hoursPerWeek: 1, maxHoursPerDay: 1 };

    expect(buildSubjectChanges([alg], [alg, desconocida])).toEqual({});
  });

  it('no incluye el id en las asignaturas nuevas', () => {
    const { new: created } = buildSubjectChanges([], [fis]);

    expect(created?.[0]).not.toHaveProperty('id');
  });
});

describe('updateCourse', () => {
  const command = (subjects: SubjectWithId[], originalSubjects: SubjectWithId[]): UpdateCourseCommand => ({
    id: 'course-1',
    code: 'MAT-101',
    name: 'Matemáticas',
    description: '',
    status: 'ACTIVE',
    subjects,
    originalSubjects,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    updateCourseMock.mockResolvedValue(async () => ({ data: {} }));
    updateSubjectsMock.mockResolvedValue(async () => ({ data: [] }));
  });

  it('llama a updateSubjects con el cuerpo de cambios y después actualiza el curso', async () => {
    const cambiada = { ...alg, code: 'ALG2' };

    await updateCourse(command([cambiada, fis], [alg, geo]));

    expect(updateSubjectsMock).toHaveBeenCalledWith('course-1', {
      new: [fis],
      update: [{ id: 'subj-1', code: 'ALG2', name: 'Álgebra', hoursPerWeek: 4, maxHoursPerDay: 2 }],
      delete: ['subj-2'],
    });
    expect(updateCourseMock).toHaveBeenCalledTimes(1);
    expect(updateSubjectsMock.mock.invocationCallOrder[0]).toBeLessThan(
      updateCourseMock.mock.invocationCallOrder[0],
    );
  });

  it('no llama a updateSubjects si no hay cambios en asignaturas, pero sí actualiza el curso', async () => {
    await updateCourse(command([alg, geo], [alg, geo]));

    expect(updateSubjectsMock).not.toHaveBeenCalled();
    expect(updateCourseMock).toHaveBeenCalledTimes(1);
  });

  it('no envía originalSubjects en el cuerpo del curso', async () => {
    await updateCourse(command([alg], [alg]));

    const body = updateCourseMock.mock.calls[0][1];
    expect(body).not.toHaveProperty('originalSubjects');
    expect(body.id).toBe('course-1');
  });

  it('propaga el error si falla la actualización de asignaturas y no actualiza el curso', async () => {
    updateSubjectsMock.mockResolvedValue(async () => {
      throw new Error('fallo de red');
    });

    await expect(updateCourse(command([alg], [alg, geo]))).rejects.toThrow('fallo de red');
    expect(updateCourseMock).not.toHaveBeenCalled();
  });
});
