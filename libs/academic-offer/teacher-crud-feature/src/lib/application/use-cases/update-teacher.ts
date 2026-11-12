import { Configuration, TeachersApiFp } from '@cgarcia0910/api-academiccatalog';
import type { UpdateTeacherCommand } from '../../domain/entities/teacher';
import { createTeacherHabilitations } from './create-teacher-habilitations';
import { PartialSaveError } from '../errors';

const teachersApi = TeachersApiFp(new Configuration({ basePath: '/resources' }));

/**
 * Actualiza los datos del profesor y, si hay filas nuevas, las envía como habilitaciones.
 * Las habilitaciones existentes no se tocan: no hay endpoint de actualización.
 * El PATCH va primero; así un reintento tras fallar el POST no duplica nada.
 */
export async function updateTeacher(command: UpdateTeacherCommand) {
  const { id, habilitations = [], ...teacher } = command;

  const request = await teachersApi.updateTeacher(id, {
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    email: teacher.email,
  });
  const updated = (await request()).data;

  if (habilitations.length > 0) {
    try {
      await createTeacherHabilitations(id, habilitations);
    } catch (error) {
      throw new PartialSaveError(id, error);
    }
  }

  return updated;
}
