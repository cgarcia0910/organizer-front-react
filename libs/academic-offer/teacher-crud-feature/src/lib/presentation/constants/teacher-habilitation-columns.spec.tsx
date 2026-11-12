import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { GridColDef } from '@mui/x-data-grid';
import { getTeacherHabilitationColumns } from './teacher-habilitation-columns';
import type { HabilitationRow } from '../../domain/entities/habilitation';

function getColumn(field: string): GridColDef<HabilitationRow> {
  const column = getTeacherHabilitationColumns().find((c) => c.field === field);
  if (!column) throw new Error(`columna ${field} no encontrada`);
  return column;
}

function renderCell(field: string, row: Partial<HabilitationRow>) {
  const column = getColumn(field);
  const value = (row as Record<string, unknown>)[field];
  return render(<div>{column.renderCell?.({ value, row } as never)}</div>);
}

const base = {
  id: 'h-1',
  teacherId: 't-1',
  courseId: 'c-1',
  subjectId: 's-1',
  courseName: 'Curso 1',
  subjectName: 'Matemáticas',
  effective: true,
  effectiveStatusReason: [],
  createdAt: '',
  updatedAt: '',
  revokedAt: null,
} as HabilitationRow;

describe('getTeacherHabilitationColumns', () => {
  it('muestra Curso, Asignatura, Estado y Efectiva', () => {
    const headers = getTeacherHabilitationColumns().map((c) => c.headerName);

    expect(headers).toEqual(['Curso', 'Asignatura', 'Estado', 'Efectiva']);
  });

  it('no tiene columna de acciones', () => {
    const fields = getTeacherHabilitationColumns().map((c) => c.field);

    expect(fields).not.toContain('actions');
  });

  it('muestra "Activa" y "Revocada" según el estado', () => {
    renderCell('status', { ...base, status: 'ACTIVE' });
    expect(screen.getByText('Activa')).toBeTruthy();
  });

  it('muestra "Revocada" para REVOKED', () => {
    renderCell('status', { ...base, status: 'REVOKED' });
    expect(screen.getByText('Revocada')).toBeTruthy();
  });

  it('muestra "Sí" cuando la habilitación es efectiva', () => {
    renderCell('effective', { ...base, status: 'ACTIVE', effective: true });
    expect(screen.getByText('Sí')).toBeTruthy();
  });

  it('muestra "No" con el motivo traducido cuando no es efectiva', () => {
    renderCell('effective', {
      ...base,
      status: 'ACTIVE',
      effective: false,
      effectiveStatusReason: ['COURSE_INACTIVE', 'SUBJECT_INACTIVE'],
    });
    expect(screen.getByText('No (Curso inactivo, Asignatura inactiva)')).toBeTruthy();
  });

  it('muestra "Profesor inactivo" como motivo', () => {
    renderCell('effective', {
      ...base,
      status: 'ACTIVE',
      effective: false,
      effectiveStatusReason: ['TEACHER_INACTIVE'],
    });
    expect(screen.getByText('No (Profesor inactivo)')).toBeTruthy();
  });
});
