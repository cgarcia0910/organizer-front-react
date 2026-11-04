import { Configuration, CoursesApiFp } from '@cgarcia0910/api-academiccatalog';
import { Course } from '../../domain/entities/courses';

const courseApi = CoursesApiFp(new Configuration({ basePath: '/resources' }));
export async function updateCourse(course: Course) {
  const request = await courseApi.updateCourse(course.id, course);
  return (await request()).data;
}
