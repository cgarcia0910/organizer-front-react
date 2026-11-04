import {
  Configuration,
  CoursesApiFp,
  ListCoursesDirectionEnum,
  ListCoursesSortEnum,
} from '@cgarcia0910/api-academiccatalog';

const courseApi = CoursesApiFp(new Configuration({ basePath: '/resources' }));
export async function getCoursePage(
  page: number,
  limit: number,
  search?: string,
  sort?: ListCoursesSortEnum,
  direction?: ListCoursesDirectionEnum,
) {
  const request = await courseApi.listCourses(
    page,
    limit,
    search,
    true,
    sort,
    direction,
  );
  return (await request()).data;
}
