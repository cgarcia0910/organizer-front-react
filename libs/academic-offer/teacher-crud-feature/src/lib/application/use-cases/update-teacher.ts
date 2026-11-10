import { Configuration, TeachersApiFp } from '@cgarcia0910/api-academiccatalog';
import type { UpdateTeacher } from '../../domain/entities/teacher';

const teachersApi = TeachersApiFp(new Configuration({ basePath: '/resources' }));

/**
 * Envía siempre los tres campos. El `id` va en la ruta, no en el cuerpo.
 */
export async function updateTeacher(teacher: UpdateTeacher) {
  const request = await teachersApi.updateTeacher(teacher.id, {
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    email: teacher.email,
  });
  return (await request()).data;
}
