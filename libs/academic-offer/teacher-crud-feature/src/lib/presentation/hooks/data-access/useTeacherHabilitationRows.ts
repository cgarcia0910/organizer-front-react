import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getCourseSubjects, type SubjectWithId } from '@react-front/courses-crud-feature';
import type { HabilitationRow } from '../../../domain/entities/habilitation';
import { useCourseOptions } from './useCourseOptions';
import { useTeacherHabilitations } from './useTeacherHabilitations';

/**
 * La API devuelve ids de curso y asignatura. Los nombres se resuelven con los cursos
 * cargados y con las asignaturas de cada curso que aparece en las habilitaciones.
 * Si un nombre no se resuelve, se muestra el id.
 */
export function useTeacherHabilitationRows(teacherId: string) {
  const habilitationsQuery = useTeacherHabilitations(teacherId);
  const coursesQuery = useCourseOptions();

  const courseIds = useMemo(
    () => [...new Set((habilitationsQuery.data ?? []).map((h) => h.courseId))],
    [habilitationsQuery.data],
  );

  const subjectQueries = useQueries({
    queries: courseIds.map((courseId) => ({
      queryKey: ['course-subjects', courseId],
      queryFn: (): Promise<SubjectWithId[]> => getCourseSubjects(courseId),
    })),
  });

  const rows = useMemo<HabilitationRow[] | undefined>(() => {
    if (!habilitationsQuery.data) return undefined;

    const courseNames = new Map((coursesQuery.data ?? []).map((c) => [c.id, c.name]));
    const subjectNames = new Map<string, string>();
    subjectQueries.forEach((q) => {
      (q.data ?? []).forEach((s) => {
        if (s.id) subjectNames.set(s.id, s.name);
      });
    });

    return habilitationsQuery.data.map((h) => ({
      ...h,
      courseName: courseNames.get(h.courseId) ?? h.courseId,
      subjectName: subjectNames.get(h.subjectId) ?? h.subjectId,
    }));
  }, [habilitationsQuery.data, coursesQuery.data, subjectQueries]);

  return {
    rows,
    isLoading: habilitationsQuery.isLoading,
    isError: habilitationsQuery.isError,
  };
}
