import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getTeacherHabilitations } from './get-teacher-habilitations';

const { listMock } = vi.hoisted(() => ({ listMock: vi.fn() }));

vi.mock('@cgarcia0910/api-academiccatalog', () => ({
  Configuration: class {},
  HabilitationsApiFp: () => ({ listTeacherHabilitations: listMock }),
}));

describe('getTeacherHabilitations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pide la primera página con 50 elementos, sin paginar', async () => {
    listMock.mockResolvedValue(async () => ({ data: { items: [] } }));

    await getTeacherHabilitations('t-1');

    expect(listMock).toHaveBeenCalledTimes(1);
    expect(listMock).toHaveBeenCalledWith('t-1', 0, 50);
  });

  it('devuelve los items de la respuesta', async () => {
    const items = [{ id: 'h-1', courseId: 'c-1', subjectId: 's-1', status: 'ACTIVE' }];
    listMock.mockResolvedValue(async () => ({ data: { items } }));

    await expect(getTeacherHabilitations('t-1')).resolves.toEqual(items);
  });
});
