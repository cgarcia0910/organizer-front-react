import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeacherHabilitationsTable } from './TeacherHabilitationsTable';
import type { HabilitationRow } from '../../domain/entities/habilitation';

const row = {
  id: 'h-1',
  teacherId: 't-1',
  courseId: 'c-1',
  subjectId: 's-1',
  status: 'ACTIVE',
  effective: true,
  effectiveStatusReason: [],
  createdAt: '',
  updatedAt: '',
  revokedAt: null,
  courseName: 'Curso Único',
  subjectName: 'Física',
} as HabilitationRow;

describe('TeacherHabilitationsTable', () => {
  it('muestra el mensaje cuando no hay habilitaciones', () => {
    render(<TeacherHabilitationsTable rows={[]} />);

    expect(screen.getByText('Este profesor no tiene habilitaciones')).toBeTruthy();
  });

  it('muestra las filas cuando hay habilitaciones', () => {
    render(<TeacherHabilitationsTable rows={[row]} />);

    expect(screen.getByText('Curso Único')).toBeTruthy();
    expect(screen.getByText('Física')).toBeTruthy();
  });

  it('no muestra paginación', () => {
    const { container } = render(<TeacherHabilitationsTable rows={[row]} />);

    expect(container.querySelector('.MuiTablePagination-root')).toBeNull();
  });
});
