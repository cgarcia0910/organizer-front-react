import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NewEditTeacherForm from './NewEditTeacherForm';
import { PartialSaveError } from '../../application/errors';
import type { HabilitationRow } from '../../domain/entities/habilitation';

const { createTeacherMock, updateTeacherMock, habilitationState, subjectsByCourse } = vi.hoisted(() => ({
  createTeacherMock: vi.fn(),
  updateTeacherMock: vi.fn(),
  habilitationState: {
    rows: [] as HabilitationRow[] | undefined,
    isLoading: false,
    isError: false,
  },
  subjectsByCourse: { current: [] as { id: string; name: string }[] },
}));

vi.mock('../../application/use-cases/create-teacher', () => ({
  createTeacher: createTeacherMock,
}));
vi.mock('../../application/use-cases/update-teacher', () => ({
  updateTeacher: updateTeacherMock,
}));
vi.mock('../hooks/data-access/useCourseOptions', () => ({
  useCourseOptions: () => ({
    data: [
      { id: 'c-1', name: 'Curso 1' },
      { id: 'c-2', name: 'Curso 2' },
    ],
  }),
}));
vi.mock('../hooks/data-access/useCourseSubjects', () => ({
  useCourseSubjects: () => ({ data: subjectsByCourse.current }),
}));
vi.mock('../hooks/data-access/useTeacherHabilitationRows', () => ({
  useTeacherHabilitationRows: () => habilitationState,
}));

// La tabla de existentes usa DataGrid; aquí sólo importa que reciba las filas.
vi.mock('./TeacherHabilitationsTable', () => ({
  TeacherHabilitationsTable: ({ rows }: { rows: HabilitationRow[] }) => (
    <div data-testid="existentes">{rows.map((r) => `${r.courseName} / ${r.subjectName}`).join(';')}</div>
  ),
}));

const subjects = [
  { id: 's-1', name: 'Matemáticas' },
  { id: 's-2', name: 'Lengua' },
];

const existingRow = {
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
  courseName: 'Curso 1',
  subjectName: 'Matemáticas',
} as HabilitationRow;

const teacher = { id: 't-1', firstName: 'Luis', lastName: 'Pérez', email: 'luis@example.com' };

function renderForm(props: { onClose?: () => void; teacher?: typeof teacher } = {}) {
  const onClose = props.onClose ?? vi.fn();
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <NewEditTeacherForm onClose={onClose} teacher={props.teacher} />
    </QueryClientProvider>,
  );
  return { onClose };
}

const fillValid = () => {
  fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText('Apellidos *'), { target: { value: 'García' } });
  fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'ana@example.com' } });
};

const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar profesor' }));

// `index` distingue la fila cuando hay varias con el mismo campo.
function chooseOption(label: string, option: string, index = 0) {
  fireEvent.mouseDown(screen.getAllByLabelText(label)[index]);
  fireEvent.click(screen.getByRole('option', { name: option }));
}

const addRow = () => fireEvent.click(screen.getByRole('button', { name: 'Añadir habilitación' }));

describe('NewEditTeacherForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    habilitationState.rows = [];
    habilitationState.isLoading = false;
    habilitationState.isError = false;
    subjectsByCourse.current = subjects;
    createTeacherMock.mockResolvedValue({ id: 't-2' });
    updateTeacherMock.mockResolvedValue({ id: 't-1' });
  });

  describe('datos del profesor', () => {
    it('en alta muestra el título "Nuevo profesor" y campos vacíos', () => {
      renderForm();

      expect(screen.getByText('Nuevo profesor')).toBeTruthy();
      expect((screen.getByLabelText('Nombre *') as HTMLInputElement).value).toBe('');
    });

    it('muestra errores en campos vacíos y no llama a la API', async () => {
      renderForm();

      submit();

      expect(await screen.findByText('El nombre es obligatorio')).toBeTruthy();
      expect(screen.getByText('Los apellidos son obligatorios')).toBeTruthy();
      expect(screen.getByText('El email es obligatorio')).toBeTruthy();
      expect(createTeacherMock).not.toHaveBeenCalled();
    });

    it('muestra error con email inválido y no llama a la API', async () => {
      renderForm();
      fillValid();
      fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'no-es-email' } });

      submit();

      expect(await screen.findByText('Introduce un email válido')).toBeTruthy();
      expect(createTeacherMock).not.toHaveBeenCalled();
    });

    it('en edición muestra los datos de la fila y el título "Editar profesor"', () => {
      renderForm({ teacher });

      expect(screen.getByText('Editar profesor')).toBeTruthy();
      expect((screen.getByLabelText('Nombre *') as HTMLInputElement).value).toBe('Luis');
      expect((screen.getByLabelText('Apellidos *') as HTMLInputElement).value).toBe('Pérez');
    });
  });

  describe('sección de habilitaciones', () => {
    it('en alta no muestra habilitaciones existentes y ofrece filas opcionales', () => {
      renderForm();

      expect(screen.getByText('Habilitaciones del profesor (opcional)')).toBeTruthy();
      expect(screen.queryByTestId('existentes')).toBeNull();
      expect(screen.queryAllByLabelText('Curso *')).toHaveLength(0);
    });

    it('en edición muestra las existentes de sólo lectura y después las nuevas', () => {
      habilitationState.rows = [existingRow];
      renderForm({ teacher });

      expect(screen.getByTestId('existentes').textContent).toBe('Curso 1 / Matemáticas');
      expect(screen.getByText('Nuevas habilitaciones')).toBeTruthy();
    });

    it('en edición muestra un error si no se pueden cargar las existentes, y permite guardar', () => {
      habilitationState.isError = true;
      renderForm({ teacher });

      expect(screen.getByText('No se pudieron cargar las habilitaciones existentes.')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Guardar profesor' })).toBeTruthy();
    });

    it('añadir y quitar filas', () => {
      renderForm();

      addRow();
      expect(screen.getAllByLabelText('Curso *')).toHaveLength(1);
      addRow();
      expect(screen.getAllByLabelText('Curso *')).toHaveLength(2);

      fireEvent.click(screen.getAllByRole('button', { name: 'Quitar habilitación' })[0]);
      expect(screen.getAllByLabelText('Curso *')).toHaveLength(1);
    });

    it('la asignatura está deshabilitada hasta elegir curso', () => {
      renderForm();
      addRow();

      expect(screen.getByLabelText('Asignatura *').getAttribute('aria-disabled')).toBe('true');
    });

    it('al cambiar el curso de una fila se limpia su asignatura', async () => {
      renderForm();
      addRow();

      chooseOption('Curso *', 'Curso 1');
      chooseOption('Asignatura *', 'Matemáticas');
      // MUI pone un espacio de ancho cero cuando el select está vacío.
      const subjectDisplay = () =>
        (screen.getAllByRole('combobox')[1].textContent ?? '').replace(/\u200b/g, '');
      expect(subjectDisplay()).toBe('Matemáticas');

      chooseOption('Curso *', 'Curso 2');

      await waitFor(() => expect(subjectDisplay()).toBe(''));
    });

    it('no ofrece una asignatura que ya tiene habilitación activa en ese curso', () => {
      habilitationState.rows = [existingRow];
      renderForm({ teacher });
      addRow();

      chooseOption('Curso *', 'Curso 1');
      fireEvent.mouseDown(screen.getByLabelText('Asignatura *'));

      expect(screen.queryByRole('option', { name: 'Matemáticas' })).toBeNull();
      expect(screen.getByRole('option', { name: 'Lengua' })).toBeTruthy();
    });

    it('una fila incompleta muestra su error y no llama a la API', async () => {
      renderForm();
      fillValid();
      addRow();

      submit();

      expect(await screen.findByText('Elige una asignatura')).toBeTruthy();
      expect(createTeacherMock).not.toHaveBeenCalled();
    });

    it('dos filas con la misma asignatura muestran error y no llaman a la API', async () => {
      renderForm();
      fillValid();
      addRow();
      chooseOption('Curso *', 'Curso 1', 0);
      chooseOption('Asignatura *', 'Lengua', 0);
      addRow();
      chooseOption('Curso *', 'Curso 1', 1);
      chooseOption('Asignatura *', 'Lengua', 1);

      submit();

      expect(await screen.findByText('Esta asignatura ya está en la lista')).toBeTruthy();
      expect(createTeacherMock).not.toHaveBeenCalled();
    });
  });

  describe('guardado en alta', () => {
    it('sin filas envía habilitations vacío y cierra tras éxito', async () => {
      const { onClose } = renderForm();
      fillValid();

      submit();

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(createTeacherMock.mock.calls[0][0]).toEqual({
        firstName: 'Ana',
        lastName: 'García',
        email: 'ana@example.com',
        habilitations: [],
      });
    });

    it('con dos filas envía ambas en el mismo alta', async () => {
      const { onClose } = renderForm();
      fillValid();
      addRow();
      chooseOption('Curso *', 'Curso 1', 0);
      chooseOption('Asignatura *', 'Matemáticas', 0);
      addRow();
      chooseOption('Curso *', 'Curso 2', 1);
      chooseOption('Asignatura *', 'Lengua', 1);

      submit();

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(createTeacherMock.mock.calls[0][0].habilitations).toEqual([
        { courseId: 'c-1', subjectId: 's-1' },
        { courseId: 'c-2', subjectId: 's-2' },
      ]);
      expect(updateTeacherMock).not.toHaveBeenCalled();
    });

    it('tras un fallo al crear el profesor muestra el error, no cierra y conserva los datos', async () => {
      createTeacherMock.mockRejectedValue(new Error('Red caída'));
      const { onClose } = renderForm();
      fillValid();

      submit();

      expect(await screen.findByText(/No se pudo guardar el profesor: Red caída/)).toBeTruthy();
      expect(onClose).not.toHaveBeenCalled();
      expect((screen.getByLabelText('Nombre *') as HTMLInputElement).value).toBe('Ana');
    });

    it('si el profesor se crea pero fallan sus habilitaciones, avisa y el siguiente guardado es una edición', async () => {
      createTeacherMock.mockRejectedValue(new PartialSaveError('t-9', new Error('conflicto')));
      const { onClose } = renderForm();
      fillValid();
      addRow();
      chooseOption('Curso *', 'Curso 1');
      chooseOption('Asignatura *', 'Matemáticas');

      submit();

      expect(
        await screen.findByText(/El profesor se guardó, pero sus habilitaciones no: conflicto/),
      ).toBeTruthy();
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByText('Editar profesor')).toBeTruthy();

      submit();

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(createTeacherMock).toHaveBeenCalledTimes(1);
      expect(updateTeacherMock.mock.calls[0][0]).toMatchObject({
        id: 't-9',
        habilitations: [{ courseId: 'c-1', subjectId: 's-1' }],
      });
    });

    it('deshabilita el botón de guardar mientras la petición está pendiente', async () => {
      createTeacherMock.mockReturnValue(new Promise(() => undefined));
      renderForm();
      fillValid();

      submit();

      await waitFor(() =>
        expect(
          (screen.getByRole('button', { name: /Guardar profesor/ }) as HTMLButtonElement).disabled,
        ).toBe(true),
      );
    });
  });

  describe('guardado en edición', () => {
    it('sin filas nuevas llama a updateTeacher con id, tres campos y habilitations vacío', async () => {
      const { onClose } = renderForm({ teacher });

      submit();

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(updateTeacherMock.mock.calls[0][0]).toEqual({
        id: 't-1',
        firstName: 'Luis',
        lastName: 'Pérez',
        email: 'luis@example.com',
        habilitations: [],
      });
      expect(createTeacherMock).not.toHaveBeenCalled();
    });

    it('con filas nuevas las envía con updateTeacher, sin tocar las existentes', async () => {
      habilitationState.rows = [existingRow];
      const { onClose } = renderForm({ teacher });
      addRow();
      chooseOption('Curso *', 'Curso 2');
      chooseOption('Asignatura *', 'Lengua');

      submit();

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(updateTeacherMock.mock.calls[0][0].habilitations).toEqual([
        { courseId: 'c-2', subjectId: 's-2' },
      ]);
    });
  });
});
