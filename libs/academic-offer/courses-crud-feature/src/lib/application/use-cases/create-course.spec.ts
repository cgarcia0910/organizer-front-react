import { describe, expect, it, vi, beforeEach } from 'vitest';

import { createCourse } from './create-course';

import type { CreateCourse } from '../../domain/entities/courses';


const { createCourseMock, createSubjectMock } = vi.hoisted(() => ({
  createCourseMock: vi.fn(),
  createSubjectMock: vi.fn(),
}));

vi.mock('@cgarcia0910/api-academiccatalog', () => ({
  Configuration: vi.fn(),
  CoursesApiFp: vi.fn(() => ({ createCourse: createCourseMock })),
  SubjectsApiFp: vi.fn(() => ({ createSubject: createSubjectMock })),
}));


const course: CreateCourse = {
  code: 'MAT-101',
  name: 'Matemáticas',
  description: '',
  status: 'ACTIVE',
  subjects: [
    { code: 'ALG', name: 'Álgebra', hoursPerWeek: 4, maxHoursPerDay: 2 },
  ],
};

describe('createCourse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createCourseMock.mockResolvedValue(async () => ({ data: { id: 'course-1' } }));
    createSubjectMock.mockResolvedValue(async () => ({ data: [] }));
  });

  it('envía el código de asignatura introducido por el usuario, no el nombre', async () => {
    await createCourse(course);

    expect(createSubjectMock).toHaveBeenCalledWith('course-1', [
      { code: 'ALG', name: 'Álgebra', hoursPerWeek: 4, maxHoursPerDay: 2 },
    ]);
  });

  it('propaga el error si falla la creación de asignaturas', async () => {
    createSubjectMock.mockResolvedValue(async () => {
      throw new Error('fallo de red');
    });

    await expect(createCourse(course)).rejects.toThrow('fallo de red');
  });
});
