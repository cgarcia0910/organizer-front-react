import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createTeacherHabilitations } from './create-teacher-habilitations';

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }));

vi.mock('@cgarcia0910/api-academiccatalog', () => ({
  Configuration: class {},
  HabilitationsApiFp: () => ({ createHabilitations: createMock }),
}));

const rows = [
  { courseId: 'c-1', subjectId: 's-1' },
  { courseId: 'c-1', subjectId: 's-2' },
];

describe('createTeacherHabilitations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía todas las filas en una sola llamada', async () => {
    createMock.mockResolvedValue(async () => ({ data: [] }));

    await createTeacherHabilitations('t-1', rows);

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith('t-1', rows);
  });

  it('propaga el error si la petición falla', async () => {
    createMock.mockRejectedValue(new Error('conflicto'));

    await expect(createTeacherHabilitations('t-1', rows)).rejects.toThrow('conflicto');
  });
});
