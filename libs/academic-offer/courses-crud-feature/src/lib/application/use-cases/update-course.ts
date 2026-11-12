import { Configuration, CoursesApiFp, SubjectsApiFp } from '@cgarcia0910/api-academiccatalog';
import { Course, UpdateCourse } from '../../domain/entities/courses';

const courseApi = CoursesApiFp(new Configuration({ basePath: '/resources' }));
const subjectsApi = SubjectsApiFp(new Configuration({ basePath: '/resources' }));

export async function updateCourse(course: UpdateCourse) {
  const request = await courseApi.updateCourse(course.id, course);
  const subjects = course.subjects.map(sbj => ({...sbj, code: sbj.name}));
  const subjectRequest = await subjectsApi.updateSubjects(course.id, subjects)
  await subjectRequest()
  return (await request()).data;
}
