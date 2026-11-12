import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreateTeacher } from './useCreateTeacher';
import { useUpdateTeacher } from './useUpdateTeacher';
import { PartialSaveError } from '../../../application/errors';

const { createTeacherMock, updateTeacherMock } = vi.hoisted(() => ({
  createTeacherMock: vi.fn(),
  updateTeacherMock: vi.fn(),
}));

vi.mock('../../../application/use-cases/create-teacher', () => ({
  createTeacher: createTeacherMock,
}));
vi.mock('../../../application/use-cases/update-teacher', () => ({
  updateTeacher: updateTeacherMock,
}));

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper, invalidateSpy };
}

const newTeacher = { firstName: 'Ana', lastName: 'García', email: 'ana@example.com' };
const existingTeacher = { id: 't-1', ...newTeacher };

describe('useCreateTeacher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalida la caché de teachers tras un éxito', async () => {
    createTeacherMock.mockResolvedValue({ id: 't-1' });
    const { wrapper, invalidateSpy } = setup();
    const { result } = renderHook(() => useCreateTeacher(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(newTeacher);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['teachers'] });
  });

  it('no invalida la caché tras un fallo', async () => {
    createTeacherMock.mockRejectedValue(new Error('fallo'));
    const { wrapper, invalidateSpy } = setup();
    const { result } = renderHook(() => useCreateTeacher(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync(newTeacher)).rejects.toThrow('fallo');
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

describe('useUpdateTeacher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalida la caché de teachers tras un éxito', async () => {
    updateTeacherMock.mockResolvedValue({ id: 't-1' });
    const { wrapper, invalidateSpy } = setup();
    const { result } = renderHook(() => useUpdateTeacher(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(existingTeacher);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['teachers'] });
  });

  it('no invalida la caché tras un fallo', async () => {
    updateTeacherMock.mockRejectedValue(new Error('fallo'));
    const { wrapper, invalidateSpy } = setup();
    const { result } = renderHook(() => useUpdateTeacher(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync(existingTeacher)).rejects.toThrow('fallo');
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

describe('habilitaciones en el guardado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useCreateTeacher invalida las habilitaciones del nuevo profesor si envió filas', async () => {
    createTeacherMock.mockResolvedValue({ id: 't-7' });
    const { wrapper, invalidateSpy } = setup();
    const { result } = renderHook(() => useCreateTeacher(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        ...newTeacher,
        habilitations: [{ courseId: 'c-1', subjectId: 's-1' }],
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['teacher-habilitations', 't-7'] });
  });

  it('useCreateTeacher sin filas no invalida habilitaciones', async () => {
    createTeacherMock.mockResolvedValue({ id: 't-7' });
    const { wrapper, invalidateSpy } = setup();
    const { result } = renderHook(() => useCreateTeacher(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ ...newTeacher, habilitations: [] });
    });

    expect(invalidateSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['teacher-habilitations', 't-7'] }),
    );
  });

  it('useCreateTeacher ante PartialSaveError invalida las habilitaciones del profesor creado', async () => {
    createTeacherMock.mockRejectedValue(new PartialSaveError('t-9', new Error('conflicto')));
    const { wrapper, invalidateSpy } = setup();
    const { result } = renderHook(() => useCreateTeacher(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(newTeacher).catch(() => undefined);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['teacher-habilitations', 't-9'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['teachers'] });
  });

  it('useUpdateTeacher ante PartialSaveError invalida las habilitaciones del profesor editado', async () => {
    updateTeacherMock.mockRejectedValue(new PartialSaveError('t-1', new Error('conflicto')));
    const { wrapper, invalidateSpy } = setup();
    const { result } = renderHook(() => useUpdateTeacher(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ ...existingTeacher, habilitations: [] }).catch(() => undefined);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['teacher-habilitations', 't-1'] });
  });
});
