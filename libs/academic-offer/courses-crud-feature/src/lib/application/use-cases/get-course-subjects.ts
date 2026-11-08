import {
  Configuration, SubjectsApiFp
} from '@cgarcia0910/api-academiccatalog';
import { SubjectWithId } from '../../domain/entities/subject';

// Tamaño fijo para no depender del valor por defecto del servidor.
const SUBJECTS_PAGE_SIZE = 50;

const subjectsApi = SubjectsApiFp(new Configuration({ basePath: '/resources' }));

/**
 * Devuelve todas las asignaturas del curso, incluidas las inactivas.
 * Si cualquier página falla, la promesa rechaza: nunca devuelve una lista parcial,
 * porque el guardado envía la lista completa y una lista parcial borraría asignaturas.
 */
export async function getCourseSubjects(
    courseId: string,
): Promise<SubjectWithId[]> {
  const items: SubjectWithId[] = [];
  let page = 0;
  let totalPages = 1;

  do {
    const request = await subjectsApi.listSubjects(
      courseId,
      page,
      SUBJECTS_PAGE_SIZE,
      undefined,
      false,
    );
    const data = (await request()).data;
    items.push(...data.items);
    totalPages = data.totalPages;
    page += 1;
  } while (page < totalPages);

  return items;
}
