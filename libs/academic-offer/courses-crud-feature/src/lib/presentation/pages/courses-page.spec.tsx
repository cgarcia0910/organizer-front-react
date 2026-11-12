import { describe, expect, it, vi, beforeEach } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CoursesPage } from './courses-page';


const { getCourseSubjectsMock } = vi.hoisted(() => ({
  getCourseSubjectsMock: vi.fn(),
}));

vi.mock('../../application/use-cases/get-course-subjects', () => ({
  getCourseSubjects: getCourseSubjectsMock,
}));

vi.mock('../hooks/data-access/useCourses', () => ({
  useCourses: () => ({ data: { items: [], totalElements: 0 }, isLoading: false }),
}));

vi.mock('../components/CoursesHeader', () => ({
  CoursesHeader: () => null,
}));

vi.mock('../components/CoursesFilters', () => ({
  CoursesFilter: () => null,
}));

// La tabla real usa DataGrid; el test sólo necesita un botón que dispare onEdit.
vi.mock('../components/CoursesTable', () => ({
  CoursesTable: ({ onEdit }: { onEdit: (course: unknown) => void }) => (
    <button onClick={() => onEdit({ id: 'course-1', code: 'MAT-101', name: 'Matemáticas', status: 'ACTIVE', subjects: [] })}>
      Editar prueba
    </button>
  ),
}));

vi.mock('../components/NewEditCourseForm', () => ({
  default: () => <div>Formulario de curso</div>,
}));


describe('CoursesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('abre el formulario de edición cuando la carga de asignaturas funciona', async () => {
    getCourseSubjectsMock.mockResolvedValue([]);
    render(<CoursesPage />);

    fireEvent.click(screen.getByText('Editar prueba'));

    expect(await screen.findByText('Formulario de curso')).toBeTruthy();
  });

  it('no abre el formulario y muestra un error si falla la carga de asignaturas', async () => {
    getCourseSubjectsMock.mockRejectedValue(new Error('Request failed'));
    render(<CoursesPage />);

    fireEvent.click(screen.getByText('Editar prueba'));

    expect(
      await screen.findByText(
        'No se pudieron cargar las asignaturas del curso. Inténtalo de nuevo.',
      ),
    ).toBeTruthy();
    await waitFor(() =>
      expect(screen.queryByText('Formulario de curso')).toBeNull(),
    );
  });
});
