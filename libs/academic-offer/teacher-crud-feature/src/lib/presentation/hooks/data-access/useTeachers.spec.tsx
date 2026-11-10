import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useTeachers } from './useTeachers';

const { getTeacherPageMock } = vi.hoisted(() => ({
  getTeacherPageMock: vi.fn(),
}));

vi.mock('../../../application/use-cases/get-teacher-page', () => ({
  getTeacherPage: getTeacherPageMock,
}));


const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('useTeachers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTeacherPageMock.mockResolvedValue({ items: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
  });

  it('llama a getTeacherPage con página, tamaño y búsqueda', async () => {
    const { result } = renderHook(() => useTeachers(2, 25, 'garcia'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getTeacherPageMock).toHaveBeenCalledWith(2, 25, 'garcia');
  });

  it('pasa la búsqueda sin normalizar al caso de uso', async () => {
    const { result } = renderHook(() => useTeachers(0, 10, ''), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getTeacherPageMock).toHaveBeenCalledWith(0, 10, '');
  });
});
