import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { GridColDef } from '@mui/x-data-grid';
import { getCourseColumns } from './course-columns';
import type { Course } from '../../domain/entities/courses';

function getColumn(field: string): GridColDef<Course> {
  const column = getCourseColumns({ onEdit: vi.fn(), onDelete: vi.fn() }).find(
    (c) => c.field === field,
  );
  if (!column) throw new Error(`columna ${field} no encontrada`);
  return column;
}

function renderStatus(value: string) {
  const column = getColumn('status');
  return render(<div>{column.renderCell?.({ value } as never)}</div>);
}

describe('getCourseColumns', () => {
  it('no incluye las columnas Modalidad ni Duración', () => {
    const fields = getCourseColumns({ onEdit: vi.fn(), onDelete: vi.fn() }).map(
      (c) => c.field,
    );

    expect(fields).not.toContain('modality');
    expect(fields).not.toContain('duration');
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
    renderStatus('DRAFT');

    expect(screen.getByText('DRAFT')).toBeTruthy();
  });
});
