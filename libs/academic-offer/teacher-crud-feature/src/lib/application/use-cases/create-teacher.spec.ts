import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createTeacher } from './create-teacher';
import { PartialSaveError } from '../errors';

const { createTeacherMock, createHabilitationsMock } = vi.hoisted(() => ({
  createTeacherMock: vi.fn(),
  createHabilitationsMock: vi.fn(),
}));

vi.mock('@cgarcia0910/api-academiccatalog', () => ({
  Configuration: vi.fn(),
  TeachersApiFp: vi.fn(() => ({ createTeacher: createTeacherMock })),
  HabilitationsApiFp: vi.fn(() => ({ createHabilitations: createHabilitationsMock })),
}));

const teacher = { firstName: 'Ana', lastName: 'García', email: 'ana@example.com' };
const rows = [
  { courseId: 'c-1', subjectId: 's-1' },
  { courseId: 'c-1', subjectId: 's-2' },
];

describe('createTeacher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createTeacherMock.mockResolvedValue(async () => ({ data: { id: 't-1' } }));
    createHabilitationsMock.mockResolvedValue(async () => ({ data: [] }));
  });

  it('envía firstName, lastName y email sin id ni habilitaciones', async () => {
    await createTeacher({ ...teacher, habilitations: rows });

    expect(createTeacherMock).toHaveBeenCalledWith(teacher);
    const body = createTeacherMock.mock.calls[0][0];
    expect(body).not.toHaveProperty('id');
    expect(body).not.toHaveProperty('habilitations');
  });

  it('devuelve el profesor creado', async () => {
    await expect(createTeacher(teacher)).resolves.toEqual({ id: 't-1' });
  });

  it('sin filas no llama a la API de habilitaciones', async () => {
    await createTeacher({ ...teacher, habilitations: [] });

    expect(createHabilitationsMock).not.toHaveBeenCalled();
  });

  it('con filas crea las habilitaciones en una sola llamada, tras el profesor', async () => {
    await createTeacher({ ...teacher, habilitations: rows });

    expect(createHabilitationsMock).toHaveBeenCalledTimes(1);
    expect(createHabilitationsMock).toHaveBeenCalledWith('t-1', rows);
    expect(createTeacherMock.mock.invocationCallOrder[0]).toBeLessThan(
      createHabilitationsMock.mock.invocationCallOrder[0],
    );
  });

  it('si falla el profesor no llama a habilitaciones y propaga el error', async () => {
    createTeacherMock.mockRejectedValue(new Error('validación'));

    await expect(createTeacher({ ...teacher, habilitations: rows })).rejects.toThrow('validación');
    expect(createHabilitationsMock).not.toHaveBeenCalled();
  });

  it('si fallan las habilitaciones lanza PartialSaveError con el id del profesor creado', async () => {
    createHabilitationsMock.mockRejectedValue(new Error('conflicto'));

    const error = await createTeacher({ ...teacher, habilitations: rows }).catch((e) => e);

    expect(error).toBeInstanceOf(PartialSaveError);
    expect(error.teacherId).toBe('t-1');
    expect(error.message).toBe('conflicto');
  });
});
