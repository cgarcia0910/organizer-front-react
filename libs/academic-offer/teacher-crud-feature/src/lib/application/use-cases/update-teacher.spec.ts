import { describe, expect, it, vi, beforeEach } from 'vitest';

import { updateTeacher } from './update-teacher';

const { updateTeacherMock } = vi.hoisted(() => ({
  updateTeacherMock: vi.fn(),
}));

vi.mock('@cgarcia0910/api-academiccatalog', () => ({
  Configuration: vi.fn(),
  TeachersApiFp: vi.fn(() => ({ updateTeacher: updateTeacherMock })),
}));

describe('updateTeacher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateTeacherMock.mockResolvedValue(async () => ({ data: { id: 't-1' } }));
  });

  it('pasa el id como ruta y no lo incluye en el cuerpo', async () => {
    await updateTeacher({ id: 't-1', firstName: 'Ana', lastName: 'García', email: 'ana@example.com' });

    expect(updateTeacherMock).toHaveBeenCalledTimes(1);
    const [pathId, body] = updateTeacherMock.mock.calls[0];
    expect(pathId).toBe('t-1');
    expect(body).not.toHaveProperty('id');
  });

  it('envía siempre los tres campos, aunque estén sin cambios', async () => {
    await updateTeacher({ id: 't-1', firstName: 'Ana', lastName: 'García', email: 'ana@example.com' });

    expect(updateTeacherMock.mock.calls[0][1]).toEqual({
      firstName: 'Ana',
      lastName: 'García',
      email: 'ana@example.com',
    });
  });
});
