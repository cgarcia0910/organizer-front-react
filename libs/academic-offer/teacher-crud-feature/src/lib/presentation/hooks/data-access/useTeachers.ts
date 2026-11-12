import { useQuery } from '@tanstack/react-query';
import { getTeacherPage } from '../../../application/use-cases/get-teacher-page';

export function useTeachers(page: number, limit: number, search?: string) {
  return useQuery({
    queryKey: ['teachers', page, limit, search],
    queryFn: () => getTeacherPage(page, limit, search),
    placeholderData: (previousData) => previousData,
  });
}
