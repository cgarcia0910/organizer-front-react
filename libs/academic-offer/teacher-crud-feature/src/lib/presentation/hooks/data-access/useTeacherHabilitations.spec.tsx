import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useTeacherHabilitations } from './useTeacherHabilitations';

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock('../../../application/use-cases/get-teacher-habilitations', () => ({
  getTeacherHabilitations: getMock,
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useTeacherHabilitations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMock.mockResolvedValue([]);
  });

  it('no consulta sin teacherId', () => {
    renderHook(() => useTeacherHabilitations(''), { wrapper });

    expect(getMock).not.toHaveBeenCalled();
  });

  it('consulta las habilitaciones del profesor', async () => {
    const { result } = renderHook(() => useTeacherHabilitations('t-1'), { wrapper });

    await vi.waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getMock).toHaveBeenCalledWith('t-1');
  });
});
