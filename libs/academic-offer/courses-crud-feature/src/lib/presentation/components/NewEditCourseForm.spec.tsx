import { describe, expect, it, vi, beforeEach } from 'vitest';

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import NewEditCourseForm from './NewEditCourseForm';

import type { UpdateCourse } from '../../domain/entities/courses';


const { createMutateAsync, updateMutateAsync } = vi.hoisted(() => ({
  createMutateAsync: vi.fn(),
  updateMutateAsync: vi.fn(),
}));

vi.mock('../hooks/data-access/useCreateCourse', () => ({
  useCreateCourse: () => ({ mutateAsync: createMutateAsync, isPending: false }),
}));

vi.mock('../hooks/data-access/useUpdateCourse', () => ({
  useUpdateCourse: () => ({ mutateAsync: updateMutateAsync, isPending: false }),
}));


function fillValidCourse() {
  fireEvent.change(screen.getByPlaceholderText('Nombre del curso'), {
    target: { value: 'Matemáticas' },
  });
  fireEvent.change(screen.getByPlaceholderText('Codigo'), {
    target: { value: 'MAT-101' },
  });
  fireEvent.change(screen.getByPlaceholderText('Ej. Matemáticas'), {
    target: { value: 'Álgebra' },
  });
  fireEvent.change(screen.getByPlaceholderText('Ej: Mat'), {
    target: { value: 'ALG' },
  });
}

const existingCourse: UpdateCourse = {
  id: 'course-1',
  code: 'MAT-101',
  name: 'Matemáticas',
  description: '',
  status: 'ACTIVE',
  subjects: [{ code: 'ALG', name: 'Álgebra', hoursPerWeek: 4, maxHoursPerDay: 2 }],
};

describe('NewEditCourseForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('creación', () => {
    it('cierra el panel tras un guardado correcto', async () => {
      createMutateAsync.mockResolvedValue({});
      const onClose = vi.fn();
      render(<NewEditCourseForm onClose={onClose} />);

      fillValidCourse();
      fireEvent.click(screen.getByText('Guardar curso'));

      await waitFor(() => expect(onClose).toHaveBeenCalled());
      expect(createMutateAsync).toHaveBeenCalledTimes(1);
    });

    it('no cierra el panel y muestra un error si la creación falla', async () => {
      createMutateAsync.mockRejectedValue(new Error('Request failed'));
      const onClose = vi.fn();
      render(<NewEditCourseForm onClose={onClose} />);

      fillValidCourse();
      fireEvent.click(screen.getByText('Guardar curso'));

      expect(
        await screen.findByText('No se pudo guardar el curso: Request failed'),
      ).toBeTruthy();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('conserva los datos introducidos tras un fallo', async () => {
      createMutateAsync.mockRejectedValue(new Error('Request failed'));
      render(<NewEditCourseForm onClose={vi.fn()} />);

      fillValidCourse();
      fireEvent.click(screen.getByText('Guardar curso'));

      await screen.findByText('No se pudo guardar el curso: Request failed');
      expect(
        (screen.getByPlaceholderText('Nombre del curso') as HTMLInputElement).value,
      ).toBe('Matemáticas');
      expect(
        (screen.getByPlaceholderText('Ej: Mat') as HTMLInputElement).value,
      ).toBe('ALG');
    });

    it('deshabilita el botón mientras se guarda', async () => {
      let resolve: (value: unknown) => void = vi.fn();
      createMutateAsync.mockReturnValue(
        new Promise((r) => {
          resolve = r;
        }),
      );
      render(<NewEditCourseForm onClose={vi.fn()} />);

      fillValidCourse();
      fireEvent.click(screen.getByText('Guardar curso'));

      await waitFor(() =>
        expect(
          (screen.getByRole('button', { name: /Guardar curso/ }) as HTMLButtonElement)
            .disabled,
        ).toBe(true),
      );
      await act(async () => {
        resolve({});
      });
    });
  });

  describe('edición', () => {
    it('no cierra el panel y muestra un error si el guardado falla', async () => {
      updateMutateAsync.mockRejectedValue(new Error('Request failed'));
      const onClose = vi.fn();
      render(<NewEditCourseForm onClose={onClose} course={existingCourse} />);

      fireEvent.click(screen.getByText('Guardar curso'));

      expect(
        await screen.findByText('No se pudo guardar el curso: Request failed'),
      ).toBeTruthy();
      expect(onClose).not.toHaveBeenCalled();
      expect(updateMutateAsync).toHaveBeenCalledTimes(1);
      expect(createMutateAsync).not.toHaveBeenCalled();
    });

    it('envía el id de cada asignatura existente tal cual', async () => {
      updateMutateAsync.mockResolvedValue({});
      const course: UpdateCourse = {
        ...existingCourse,
        subjects: [
          { id: 'subj-1', code: 'ALG', name: 'Álgebra', hoursPerWeek: 4, maxHoursPerDay: 2 },
          { id: 'subj-2', code: 'GEO', name: 'Geometría', hoursPerWeek: 3, maxHoursPerDay: 1 },
        ],
      };
      render(<NewEditCourseForm onClose={vi.fn()} course={course} />);

      fireEvent.click(screen.getByText('Guardar curso'));

      await waitFor(() => expect(updateMutateAsync).toHaveBeenCalledTimes(1));
      const sent = updateMutateAsync.mock.calls[0][0].subjects;
      expect(sent.map((s: { id?: string }) => s.id)).toEqual(['subj-1', 'subj-2']);
    });

    it('envía sin id una asignatura añadida y no envía la quitada', async () => {
      updateMutateAsync.mockResolvedValue({});
      const course: UpdateCourse = {
        ...existingCourse,
        subjects: [
          { id: 'subj-1', code: 'ALG', name: 'Álgebra', hoursPerWeek: 4, maxHoursPerDay: 2 },
          { id: 'subj-2', code: 'GEO', name: 'Geometría', hoursPerWeek: 3, maxHoursPerDay: 1 },
        ],
      };
      const { container } = render(<NewEditCourseForm onClose={vi.fn()} course={course} />);

      // Quitar la primera asignatura (subj-1)
      const deleteIcons = container.querySelectorAll('[data-testid="DeleteOutlinedIcon"]');
      fireEvent.click(deleteIcons[0].closest('button') as HTMLButtonElement);

      // Añadir una nueva y rellenarla
      fireEvent.click(screen.getByText('Añadir asignatura'));
      const names = screen.getAllByPlaceholderText('Ej. Matemáticas');
      const codes = screen.getAllByPlaceholderText('Ej: Mat');
      fireEvent.change(names[names.length - 1], { target: { value: 'Física' } });
      fireEvent.change(codes[codes.length - 1], { target: { value: 'FIS' } });

      fireEvent.click(screen.getByText('Guardar curso'));

      await waitFor(() => expect(updateMutateAsync).toHaveBeenCalledTimes(1));
      const sent = updateMutateAsync.mock.calls[0][0].subjects;
      expect(sent).toHaveLength(2);
      expect(sent[0].id).toBe('subj-2');
      expect(sent[1]).not.toHaveProperty('id');
      expect(sent[1].name).toBe('Física');
    });
  });
});
