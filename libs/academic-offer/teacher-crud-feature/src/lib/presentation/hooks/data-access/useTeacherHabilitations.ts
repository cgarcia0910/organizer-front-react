import { useQuery } from '@tanstack/react-query';
import { getTeacherHabilitations } from '../../../application/use-cases/get-teacher-habilitations';

export function useTeacherHabilitations(teacherId: string) {
  return useQuery({
    queryKey: ['teacher-habilitations', teacherId],
    queryFn: () => getTeacherHabilitations(teacherId),
    enabled: !!teacherId,
  });
}
