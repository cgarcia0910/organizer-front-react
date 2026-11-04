import { useQuery } from '@tanstack/react-query';
import { getCoursePage } from '../../../application/use-cases/get-course-page';
import {
  ListCoursesSortEnum,
  ListCoursesDirectionEnum,
} from '@cgarcia0910/api-academiccatalog';

export function useCourses(
  page: number,
  limit: number,
  search?: string,
  sort?: ListCoursesSortEnum,
  direction?: ListCoursesDirectionEnum,
) {
  return useQuery({
    queryKey: ['courses', page, limit, search, sort, direction],
    queryFn: () =>
      getCoursePage(
        page,
        limit,
        search === '' ? undefined : search,
        sort,
        direction,
      ),
    placeholderData: (previousData) => previousData,
  });
}
