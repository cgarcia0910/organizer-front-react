import { Configuration, HabilitationsApiFp } from '@cgarcia0910/api-academiccatalog';
import type { Habilitation } from '../../domain/entities/habilitation';

const habilitationsApi = HabilitationsApiFp(new Configuration({ basePath: '/resources' }));

// Primera página, sin paginación en la interfaz: se espera un máximo de unas 10 por profesor.
const HABILITATIONS_PAGE = 0;
const HABILITATIONS_SIZE = 50;

export async function getTeacherHabilitations(teacherId: string): Promise<Habilitation[]> {
  const request = await habilitationsApi.listTeacherHabilitations(
    teacherId,
    HABILITATIONS_PAGE,
    HABILITATIONS_SIZE,
  );
  const data = (await request()).data;
  // El cliente tipa effectiveStatusReason como Set; en JSON llega como array.
  return data.items as unknown as Habilitation[];
}
