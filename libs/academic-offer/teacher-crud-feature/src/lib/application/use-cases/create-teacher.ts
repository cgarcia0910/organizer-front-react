import { Configuration, TeachersApiFp } from '@cgarcia0910/api-academiccatalog';
import type { CreateTeacherCommand } from '../../domain/entities/teacher';
import { createTeacherHabilitations } from './create-teacher-habilitations';
import { PartialSaveError } from '../errors';

const teachersApi = TeachersApiFp(new Configuration({ basePath: '/resources' }));

/**
 * Crea el profesor y, si hay filas, sus habilitaciones en una sola llamada posterior.
 * El profesor va primero: si las habilitaciones fallan, se lanza PartialSaveError con su id.
 */
export async function createTeacher(command: CreateTeacherCommand) {
  const { habilitations = [], ...teacher } = command;

  const request = await teachersApi.createTeacher({
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    email: teacher.email,
  });
  const created = (await request()).data;

  if (habilitations.length > 0) {
    try {
      await createTeacherHabilitations(created.id, habilitations);
    } catch (error) {
      throw new PartialSaveError(created.id, error);
    }
  }

  return created;
}
