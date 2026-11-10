import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeachersPage } from './teachers-page';
import type { Teacher } from '../../domain/entities/teacher';

const { getTeacherPageMock, createTeacherMock, updateTeacherMock, tableProps } = vi.hoisted(() => ({
  getTeacherPageMock: vi.fn(),
  createTeacherMock: vi.fn(),
  updateTeacherMock: vi.fn(),
  tableProps: { current: null as null | { onEdit: (t: unknown) => void } },
}));

vi.mock('../../application/use-cases/get-teacher-page', () => ({
  getTeacherPage: getTeacherPageMock,
}));
vi.mock('../../application/use-cases/create-teacher', () => ({
  createTeacher: createTeacherMock,
}));
vi.mock('../../application/use-cases/update-teacher', () => ({
  updateTeacher: updateTeacherMock,
}));

// La tabla real usa DataGrid; aquí sólo hace falta una fila con botón de editar.
vi.mock('../components/TeachersTable', () => ({
  TeachersTable: (props: { onEdit: (t: unknown) => void }) => {
    tableProps.current = props;
    return (
      <button onClick={() => props.onEdit(row)}>Editar fila</button>
    );
  },
}));

const row: Teacher = {
  id: 't-1',
  firstName: 'Luis',
  lastName: 'Pérez',
  email: 'luis@example.com',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <TeachersPage />
    </QueryClientProvider>,
  );
}

const heading = (name: string) => screen.queryByRole('heading', { name });

describe('TeachersPage: alta y edición', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTeacherPageMock.mockResolvedValue({ items: [row], page: 0, size: 10, totalElements: 1, totalPages: 1 });
    createTeacherMock.mockResolvedValue({ id: 't-2' });
    updateTeacherMock.mockResolvedValue({ id: 't-1' });
  });

  it('"Nuevo profesor" abre el formulario vacío', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Nuevo profesor/ }));

    expect(await screen.findByRole('heading', { name: 'Nuevo profesor' })).toBeTruthy();
    expect((screen.getByLabelText('Nombre *') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Email *') as HTMLInputElement).value).toBe('');
  });

  it('"Editar profesor" abre el formulario con los datos de la fila', async () => {
    renderPage();

    fireEvent.click(screen.getByText('Editar fila'));

    expect(await screen.findByRole('heading', { name: 'Editar profesor' })).toBeTruthy();
    expect((screen.getByLabelText('Nombre *') as HTMLInputElement).value).toBe('Luis');
    expect((screen.getByLabelText('Apellidos *') as HTMLInputElement).value).toBe('Pérez');
    expect((screen.getByLabelText('Email *') as HTMLInputElement).value).toBe('luis@example.com');
  });

  it('tras guardar con éxito el panel se cierra y el listado se vuelve a consultar', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Nuevo profesor/ }));
    await screen.findByRole('heading', { name: 'Nuevo profesor' });

    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Apellidos *'), { target: { value: 'García' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'ana@example.com' } });
    const callsBefore = getTeacherPageMock.mock.calls.length;

    fireEvent.click(screen.getByRole('button', { name: 'Guardar profesor' }));

    await waitFor(() => expect(heading('Nuevo profesor')).toBeNull());
    await waitFor(() => expect(getTeacherPageMock.mock.calls.length).toBeGreaterThan(callsBefore));
    expect(createTeacherMock).toHaveBeenCalledTimes(1);
  });
});
