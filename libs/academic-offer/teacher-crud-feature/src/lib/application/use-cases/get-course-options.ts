import { Configuration, CoursesApiFp } from '@cgarcia0910/api-academiccatalog';

const coursesApi = CoursesApiFp(new Configuration({ basePath: '/resources' }));

// Primera página de cursos: el selector de curso no pagina.
const COURSE_OPTIONS_SIZE = 50;

export async function getCourseOptions() {
  const request = await coursesApi.listCourses(0, COURSE_OPTIONS_SIZE);
  return (await request()).data.items;
}
