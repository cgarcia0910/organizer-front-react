import { describe, expect, it, vi, beforeEach } from 'vitest';

import { createTeacher } from './create-teacher';

const { createTeacherMock } = vi.hoisted(() => ({
  createTeacherMock: vi.fn(),
}));

vi.mock('@cgarcia0910/api-academiccatalog', () => ({
  Configuration: vi.fn(),
  TeachersApiFp: vi.fn(() => ({ createTeacher: createTeacherMock })),
}));

describe('createTeacher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createTeacherMock.mockResolvedValue(async () => ({ data: { id: 't-1' } }));
  });

  it('envía firstName, lastName y email sin id', async () => {
    await createTeacher({ firstName: 'Ana', lastName: 'García', email: 'ana@example.com' });

    expect(createTeacherMock).toHaveBeenCalledWith({
      firstName: 'Ana',
      lastName: 'García',
      email: 'ana@example.com',
    });
    const body = createTeacherMock.mock.calls[0][0];
    expect(body).not.toHaveProperty('id');
  });

  it('devuelve el profesor creado', async () => {
    await expect(
      createTeacher({ firstName: 'Ana', lastName: 'García', email: 'ana@example.com' }),
    ).resolves.toEqual({ id: 't-1' });
  });
});
