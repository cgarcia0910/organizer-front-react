import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreateTeacher } from './useCreateTeacher';
import { useUpdateTeacher } from './useUpdateTeacher';

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
