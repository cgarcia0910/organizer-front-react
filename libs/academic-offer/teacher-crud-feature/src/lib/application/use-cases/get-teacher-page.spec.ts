import { describe, expect, it, vi, beforeEach } from 'vitest';

import { getTeacherPage } from './get-teacher-page';

const { listTeachersMock } = vi.hoisted(() => ({
  listTeachersMock: vi.fn(),
}));

vi.mock('@cgarcia0910/api-academiccatalog', () => ({
  Configuration: vi.fn(),
  TeachersApiFp: vi.fn(() => ({ listTeachers: listTeachersMock })),
}));

describe('getTeacherPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listTeachersMock.mockResolvedValue(async () => ({
      data: { items: [], page: 0, size: 10, totalElements: 0, totalPages: 0 },
    }));
  });

  it('pasa page, size y search a listTeachers y devuelve los datos', async () => {
    const data = { items: [{ id: 't1' }], page: 0, size: 10, totalElements: 1, totalPages: 1 };
    listTeachersMock.mockResolvedValue(async () => ({ data }));

    const result = await getTeacherPage(0, 10, 'garcia');

    expect(listTeachersMock).toHaveBeenCalledWith(0, 10, 'garcia');
    expect(result).toEqual(data);
  });

  it('no envía search cuando la búsqueda está vacía', async () => {
    await getTeacherPage(0, 10, '');

    expect(listTeachersMock).toHaveBeenCalledWith(0, 10, undefined);
  });

  it('no envía search cuando la búsqueda sólo tiene espacios', async () => {
    await getTeacherPage(0, 10, '   ');

    expect(listTeachersMock).toHaveBeenCalledWith(0, 10, undefined);
  });

  it('no envía search cuando no se pasa búsqueda', async () => {
    await getTeacherPage(2, 25);

    expect(listTeachersMock).toHaveBeenCalledWith(2, 25, undefined);
  });
});
