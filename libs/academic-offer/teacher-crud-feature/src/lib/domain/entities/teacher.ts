import type { HabilitationCreate } from './habilitation';

export type TeacherStatus = 'ACTIVE' | 'INACTIVE';

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: TeacherStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateTeacher = Omit<Teacher, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

export type UpdateTeacher = Pick<Teacher, 'id' | 'firstName' | 'lastName' | 'email'>;

// Comandos del formulario: además de los datos, llevan las habilitaciones nuevas.
export type CreateTeacherCommand = CreateTeacher & { habilitations?: HabilitationCreate[] };

export type UpdateTeacherCommand = UpdateTeacher & { habilitations?: HabilitationCreate[] };
