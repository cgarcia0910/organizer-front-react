import { Configuration, TeachersApiFp } from '@cgarcia0910/api-academiccatalog';

const teachersApi = TeachersApiFp(new Configuration({ basePath: '/resources' }));

/**
 * Página de profesores. Una búsqueda vacía no envía el parámetro `search`.
 * Sin `status`, el servidor decide qué estados devuelve por defecto.
 */
export async function getTeacherPage(page: number, limit: number, search?: string) {
  const request = await teachersApi.listTeachers(
    page,
    limit,
    search?.trim() ? search : undefined,
  );
  return (await request()).data;
}
