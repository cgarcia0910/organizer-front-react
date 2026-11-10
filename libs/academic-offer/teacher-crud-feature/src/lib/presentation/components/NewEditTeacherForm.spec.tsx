import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NewEditTeacherForm from './NewEditTeacherForm';

const { createTeacherMock, updateTeacherMock } = vi.hoisted(() => ({
  createTeacherMock: vi.fn(),
  updateTeacherMock: vi.fn(),
}));

vi.mock('../../application/use-cases/create-teacher', () => ({
  createTeacher: createTeacherMock,
}));
vi.mock('../../application/use-cases/update-teacher', () => ({
  updateTeacher: updateTeacherMock,
}));

function renderForm(props: { onClose?: () => void; teacher?: { id: string; firstName: string; lastName: string; email: string } } = {}) {
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

describe('NewEditTeacherForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('en alta envía firstName, lastName y email, y cierra el panel tras éxito', async () => {
    createTeacherMock.mockResolvedValue({ id: 't-1' });
    const { onClose } = renderForm();
    fillValid();

    submit();

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(createTeacherMock.mock.calls[0][0]).toEqual({
      firstName: 'Ana',
      lastName: 'García',
      email: 'ana@example.com',
    });
  });

  it('tras un fallo muestra el error, no cierra el panel y conserva los datos', async () => {
    createTeacherMock.mockRejectedValue(new Error('Red caída'));
    const { onClose } = renderForm();
    fillValid();

    submit();

    expect(await screen.findByText(/No se pudo guardar el profesor: Red caída/)).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
    expect((screen.getByLabelText('Nombre *') as HTMLInputElement).value).toBe('Ana');
    expect((screen.getByLabelText('Email *') as HTMLInputElement).value).toBe('ana@example.com');
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

  it('en edición muestra los datos de la fila y llama a updateTeacher con id y tres campos', async () => {
    updateTeacherMock.mockResolvedValue({ id: 't-1' });
    const { onClose } = renderForm({
      teacher: { id: 't-1', firstName: 'Luis', lastName: 'Pérez', email: 'luis@example.com' },
    });

    expect(screen.getByText('Editar profesor')).toBeTruthy();
    expect((screen.getByLabelText('Nombre *') as HTMLInputElement).value).toBe('Luis');
    expect((screen.getByLabelText('Apellidos *') as HTMLInputElement).value).toBe('Pérez');

    submit();

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(updateTeacherMock.mock.calls[0][0]).toEqual({
      id: 't-1',
      firstName: 'Luis',
      lastName: 'Pérez',
      email: 'luis@example.com',
    });
    expect(createTeacherMock).not.toHaveBeenCalled();
  });
});
