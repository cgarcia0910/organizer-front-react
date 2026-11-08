import { describe, expect, it, vi, beforeEach } from 'vitest';

import { updateCourse } from './update-course';

import type { UpdateCourse } from '../../domain/entities/courses';


const { updateCourseMock, updateSubjectsMock } = vi.hoisted(() => ({
  updateCourseMock: vi.fn(),
  updateSubjectsMock: vi.fn(),
}));

vi.mock('@cgarcia0910/api-academiccatalog', () => ({
  Configuration: vi.fn(),
  CoursesApiFp: vi.fn(() => ({ updateCourse: updateCourseMock })),
  SubjectsApiFp: vi.fn(() => ({ updateSubjects: updateSubjectsMock })),
}));


const course: UpdateCourse = {
  id: 'course-1',
  code: 'MAT-101',
  name: 'Matemáticas',
  description: '',
  status: 'ACTIVE',
  subjects: [
    { code: 'ALG', name: 'Álgebra', hoursPerWeek: 4, maxHoursPerDay: 2 },
  ],
};

describe('updateCourse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateCourseMock.mockResolvedValue(async () => ({ data: course }));
    updateSubjectsMock.mockResolvedValue(async () => ({ data: [] }));
  });

  it('envía el id de las asignaturas existentes y no lo envía en las nuevas', async () => {
    await updateCourse({
      ...course,
      subjects: [
        { id: 'subj-1', code: 'ALG', name: 'Álgebra', hoursPerWeek: 4, maxHoursPerDay: 2 },
        { code: 'GEO', name: 'Geometría', hoursPerWeek: 3, maxHoursPerDay: 1 },
      ],
    });

    const body = updateSubjectsMock.mock.calls[0][1];
    expect(body[0]).toEqual({ id: 'subj-1', code: 'ALG', name: 'Álgebra', hoursPerWeek: 4, maxHoursPerDay: 2 });
    expect(body[1]).not.toHaveProperty('id');
    expect(body[1]).toEqual({ code: 'GEO', name: 'Geometría', hoursPerWeek: 3, maxHoursPerDay: 1 });
  });

  it('envía el código de asignatura introducido por el usuario, no el nombre', async () => {
    await updateCourse(course);

    expect(updateSubjectsMock).toHaveBeenCalledWith('course-1', [
      { code: 'ALG', name: 'Álgebra', hoursPerWeek: 4, maxHoursPerDay: 2 },
    ]);
  });

  it('propaga el error si falla la actualización de asignaturas', async () => {
    updateSubjectsMock.mockResolvedValue(async () => {
      throw new Error('fallo de red');
    });

    await expect(updateCourse(course)).rejects.toThrow('fallo de red');
  });
});
