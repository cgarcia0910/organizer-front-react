import { useQuery } from '@tanstack/react-query';
import { getCourseSubjects, type SubjectWithId } from '@react-front/courses-crud-feature';

/** Asignaturas de un curso; no se pide hasta que hay curso elegido. */
export function useCourseSubjects(courseId: string | undefined) {
  return useQuery({
    queryKey: ['course-subjects', courseId],
    queryFn: (): Promise<SubjectWithId[]> => getCourseSubjects(courseId as string),
    enabled: !!courseId,
  });
}
