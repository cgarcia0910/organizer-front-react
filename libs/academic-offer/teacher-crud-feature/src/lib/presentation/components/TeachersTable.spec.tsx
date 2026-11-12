import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { GridColDef } from '@mui/x-data-grid';
import { TeachersTable } from './TeachersTable';
import type { Teacher } from '../../domain/entities/teacher';

// DataGrid no pinta filas en jsdom: se sustituye por una tabla simple que usa los renderCell reales.
vi.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows, columns }: { rows: Teacher[]; columns: GridColDef<Teacher>[] }) => (
    <table>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            {columns.map((col) => (
              <td key={col.field}>
                {col.renderCell
                  ? col.renderCell({ row, value: row[col.field as keyof Teacher] } as never)
                  : String(row[col.field as keyof Teacher] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

const teacher: Teacher = {
  id: 't-1',
  firstName: 'Ana',
  lastName: 'García',
  email: 'ana@example.com',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('TeachersTable', () => {
  it('cada fila tiene el botón de editar y lo pasa a onEdit con la fila', () => {
    const onEdit = vi.fn();
    render(
      <TeachersTable
        teachers={[teacher]}
        totalRows={1}
        paginationModel={{ page: 0, pageSize: 10 }}
        onPaginationChange={vi.fn()}
        onEdit={onEdit}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar profesor' }));

    expect(onEdit).toHaveBeenCalledWith(teacher);
  });
});
