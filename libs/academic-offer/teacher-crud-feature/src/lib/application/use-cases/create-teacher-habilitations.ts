import { Configuration, HabilitationsApiFp } from '@cgarcia0910/api-academiccatalog';
import type { HabilitationCreate } from '../../domain/entities/habilitation';

const habilitationsApi = HabilitationsApiFp(new Configuration({ basePath: '/resources' }));

/** Envía todas las filas en una única petición. */
export async function createTeacherHabilitations(
  teacherId: string,
  habilitations: HabilitationCreate[],
) {
  const request = await habilitationsApi.createHabilitations(teacherId, habilitations);
  return (await request()).data;
}
