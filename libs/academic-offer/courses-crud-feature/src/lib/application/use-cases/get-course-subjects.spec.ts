import { describe, expect, it, vi, beforeEach } from 'vitest';

import { getCourseSubjects } from './get-course-subjects';

const { listSubjectsMock } = vi.hoisted(() => ({
  listSubjectsMock: vi.fn(),
}));

vi.mock('@cgarcia0910/api-academiccatalog', () => ({
  Configuration: vi.fn(),
  SubjectsApiFp: vi.fn(() => ({ listSubjects: listSubjectsMock })),
}));


const subject = (id: string) => ({
  id,
  courseId: 'course-1',
  code: `C${id}`,
  name: `Asignatura ${id}`,
  hoursPerWeek: 2,
  maxHoursPerDay: 1,
  status: 'ACTIVE',
  createdAt: '',
  updatedAt: '',
});

describe('getCourseSubjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('recorre todas las páginas e incluye las inactivas', async () => {
    listSubjectsMock.mockImplementation((_c: string, page: number) =>
      Promise.resolve(async () => ({
        data: {
          items: page === 0 ? [subject('1'), subject('2')] : [subject('3')],
          page,
          size: 50,
          totalElements: 3,
          totalPages: 2,
        },
      })),
    );

    const result = await getCourseSubjects('course-1');

    expect(result.map((s) => s.id)).toEqual(['1', '2', '3']);
    expect(listSubjectsMock).toHaveBeenCalledTimes(2);
    expect(listSubjectsMock.mock.calls[0]).toEqual(['course-1', 0, 50, undefined, false]);
    expect(listSubjectsMock.mock.calls[1]).toEqual(['course-1', 1, 50, undefined, false]);
  });

  it('rechaza si una página falla y nunca devuelve una lista parcial', async () => {
    listSubjectsMock.mockImplementation((_c: string, page: number) =>
      Promise.resolve(async () => {
        if (page === 1) throw new Error('fallo de red');
        return {
          data: { items: [subject('1')], page, size: 50, totalElements: 3, totalPages: 2 },
        };
      }),
    );

    await expect(getCourseSubjects('course-1')).rejects.toThrow('fallo de red');
  });
});
