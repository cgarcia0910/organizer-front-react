import { Configuration, CoursesApiFp, SubjectsApiFp } from '@cgarcia0910/api-academiccatalog';
import { UpdateCourse } from '../../domain/entities/courses';

const courseApi = CoursesApiFp(new Configuration({ basePath: '/resources' }));
const subjectsApi = SubjectsApiFp(new Configuration({ basePath: '/resources' }));

export async function updateCourse(course: UpdateCourse) {
  const request = await courseApi.updateCourse(course.id, course);
  const subjectRequest = await subjectsApi.updateSubjects(course.id, course.subjects)
  await subjectRequest()
  return (await request()).data;
}
