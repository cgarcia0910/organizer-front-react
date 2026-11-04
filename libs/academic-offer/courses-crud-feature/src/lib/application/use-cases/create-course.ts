import { Configuration, CoursesApiFp } from '@cgarcia0910/api-academiccatalog';
import { CreateCourse } from '../../domain/entities/courses';

const courseApi = CoursesApiFp(new Configuration({ basePath: '/resources' }));
export async function createCourse(course: CreateCourse) {
  const request = await courseApi.createCourse(course);
  return (await request()).data;
}
