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
