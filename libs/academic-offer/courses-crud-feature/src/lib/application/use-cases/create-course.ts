import { Configuration, CoursesApiFp, SubjectsApiFp } from '@cgarcia0910/api-academiccatalog';
import { CreateCourse } from '../../domain/entities/courses';

const courseApi = CoursesApiFp(new Configuration({ basePath: '/resources' }));
const subjectsApi = SubjectsApiFp(new Configuration({ basePath: '/resources' }));
export async function createCourse(course: CreateCourse) {
  const request = await courseApi.createCourse(course);
  const courseData = (await request()).data; 

  const subjects = course.subjects.map(sb => ({...sb, code: sb.name}))
  const subjectsRequest = await subjectsApi.createSubject(courseData.id, subjects);
  (await subjectsRequest())
  return course;
}
