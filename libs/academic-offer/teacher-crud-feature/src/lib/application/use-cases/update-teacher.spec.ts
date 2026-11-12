import { describe, expect, it, vi, beforeEach } from 'vitest';
import { updateTeacher } from './update-teacher';
import { PartialSaveError } from '../errors';

const { updateTeacherMock, createHabilitationsMock } = vi.hoisted(() => ({
  updateTeacherMock: vi.fn(),
  createHabilitationsMock: vi.fn(),
}));

vi.mock('@cgarcia0910/api-academiccatalog', () => ({
  Configuration: vi.fn(),
  TeachersApiFp: vi.fn(() => ({ updateTeacher: updateTeacherMock })),
  HabilitationsApiFp: vi.fn(() => ({ createHabilitations: createHabilitationsMock })),
}));

const teacher = { id: 't-1', firstName: 'Ana', lastName: 'García', email: 'ana@example.com' };
const rows = [{ courseId: 'c-1', subjectId: 's-1' }];

describe('updateTeacher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateTeacherMock.mockResolvedValue(async () => ({ data: { id: 't-1' } }));
    createHabilitationsMock.mockResolvedValue(async () => ({ data: [] }));
  });

  it('pasa el id como ruta y envía siempre los tres campos, sin id ni habilitaciones en el cuerpo', async () => {
    await updateTeacher({ ...teacher, habilitations: rows });

    expect(updateTeacherMock).toHaveBeenCalledTimes(1);
    const [pathId, body] = updateTeacherMock.mock.calls[0];
    expect(pathId).toBe('t-1');
    expect(body).toEqual({ firstName: 'Ana', lastName: 'García', email: 'ana@example.com' });
  });

  it('sin filas nuevas sólo hace PATCH', async () => {
    await updateTeacher({ ...teacher, habilitations: [] });

    expect(createHabilitationsMock).not.toHaveBeenCalled();
  });

  it('con filas nuevas las envía en una sola llamada, tras el PATCH', async () => {
    await updateTeacher({ ...teacher, habilitations: rows });

    expect(createHabilitationsMock).toHaveBeenCalledTimes(1);
    expect(createHabilitationsMock).toHaveBeenCalledWith('t-1', rows);
    expect(updateTeacherMock.mock.invocationCallOrder[0]).toBeLessThan(
      createHabilitationsMock.mock.invocationCallOrder[0],
    );
  });

  it('si falla el PATCH no llama a habilitaciones', async () => {
    updateTeacherMock.mockRejectedValue(new Error('404'));

    await expect(updateTeacher({ ...teacher, habilitations: rows })).rejects.toThrow('404');
    expect(createHabilitationsMock).not.toHaveBeenCalled();
  });

  it('si falla el POST lanza PartialSaveError con el id del profesor', async () => {
    createHabilitationsMock.mockRejectedValue(new Error('conflicto'));

    const error = await updateTeacher({ ...teacher, habilitations: rows }).catch((e) => e);

    expect(error).toBeInstanceOf(PartialSaveError);
    expect(error.teacherId).toBe('t-1');
  });
});
