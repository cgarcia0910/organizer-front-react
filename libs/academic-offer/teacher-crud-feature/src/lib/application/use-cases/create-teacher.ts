import { Configuration, TeachersApiFp } from '@cgarcia0910/api-academiccatalog';
import type { CreateTeacher } from '../../domain/entities/teacher';

const teachersApi = TeachersApiFp(new Configuration({ basePath: '/resources' }));

export async function createTeacher(teacher: CreateTeacher) {
  const request = await teachersApi.createTeacher({
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    email: teacher.email,
  });
  return (await request()).data;
}
