import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { GridColDef } from '@mui/x-data-grid';
import { getTeacherColumns } from './teacher-columns';
import type { Teacher } from '../../domain/entities/teacher';

function getColumn(field: string): GridColDef<Teacher> {
  const column = getTeacherColumns({ onEdit: vi.fn() }).find((c) => c.field === field);
  if (!column) throw new Error(`columna ${field} no encontrada`);
  return column;
}

function renderStatus(value: string) {
  const column = getColumn('status');
  return render(<div>{column.renderCell?.({ value } as never)}</div>);
}

describe('getTeacherColumns', () => {
  it('muestra las columnas Nombre, Apellidos, Email y Estado', () => {
    const fields = getTeacherColumns({ onEdit: vi.fn() }).map((c) => c.field);

    expect(fields).toEqual(['firstName', 'lastName', 'email', 'status', 'actions']);
  });

  it('la columna Acciones tiene sólo el botón de editar, sin eliminar', () => {
    const column = getColumn('actions');
    render(<div>{column.renderCell?.({ row: { id: 't-1' } } as never)}</div>);

    expect(screen.getByRole('button', { name: 'Editar profesor' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Habilitaciones' })).toBeNull();
    expect(screen.queryByRole('button', { name: /eliminar/i })).toBeNull();
  });

  it('muestra "Activo" para el estado ACTIVE', () => {
    renderStatus('ACTIVE');

    expect(screen.getByText('Activo')).toBeTruthy();
  });

  it('muestra "Inactivo" para el estado INACTIVE', () => {
    renderStatus('INACTIVE');

    expect(screen.getByText('Inactivo')).toBeTruthy();
  });

  it('muestra el valor crudo para un estado desconocido', () => {
    renderStatus('ON_LEAVE');

    expect(screen.getByText('ON_LEAVE')).toBeTruthy();
  });
});
