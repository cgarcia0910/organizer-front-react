import { useQuery } from '@tanstack/react-query';
import { getCourseOptions } from '../../../application/use-cases/get-course-options';

export function useCourseOptions() {
  return useQuery({
    queryKey: ['course-options'],
    queryFn: getCourseOptions,
  });
}
