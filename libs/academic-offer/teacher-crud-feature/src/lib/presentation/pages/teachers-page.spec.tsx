import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { GridPaginationModel } from '@mui/x-data-grid';
import { TeachersPage } from './teachers-page';

const { useTeachersMock, tableProps } = vi.hoisted(() => ({
  useTeachersMock: vi.fn(),
  tableProps: { current: null as null | { teachers: unknown[]; onPaginationChange: (m: GridPaginationModel) => void } },
}));

vi.mock('../hooks/data-access/useTeachers', () => ({
  useTeachers: useTeachersMock,
}));

// La tabla real usa DataGrid; el test sólo necesita ver las props y disparar un cambio de página.
vi.mock('../components/TeachersTable', () => ({
  TeachersTable: (props: { teachers: unknown[]; onPaginationChange: (m: GridPaginationModel) => void }) => {
    tableProps.current = props;
    return (
      <button onClick={() => props.onPaginationChange({ page: 2, pageSize: 10 })}>
        Ir a página 3
      </button>
    );
  },
}));


const okResponse = { items: [{ id: 't1' }], page: 0, size: 10, totalElements: 1, totalPages: 1 };

describe('TeachersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTeachersMock.mockReturnValue({ data: okResponse, isLoading: false, isError: false });
  });

  it('vuelve a la página 0 al cambiar la búsqueda', () => {
    render(<TeachersPage />);

    fireEvent.click(screen.getByText('Ir a página 3'));
    expect(useTeachersMock).toHaveBeenLastCalledWith(2, 10, '');

    fireEvent.change(screen.getByPlaceholderText(/Buscar por nombre/), {
      target: { value: 'garcia' },
    });

    expect(useTeachersMock).toHaveBeenLastCalledWith(0, 10, 'garcia');
  });

  it('muestra un mensaje de error y no muestra filas si la carga falla', () => {
    useTeachersMock.mockReturnValue({ data: okResponse, isLoading: false, isError: true });
    render(<TeachersPage />);

    expect(
      screen.getByText('No se pudieron cargar los profesores. Inténtalo de nuevo.'),
    ).toBeTruthy();
    expect(tableProps.current?.teachers).toEqual([]);
  });

  it('muestra las filas de la respuesta cuando la carga va bien', () => {
    render(<TeachersPage />);

    expect(tableProps.current?.teachers).toEqual([{ id: 't1' }]);
    expect(screen.queryByText(/No se pudieron cargar/)).toBeNull();
  });
});
