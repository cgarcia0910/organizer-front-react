import { Subject, SubjectWithId } from "./subject";

export type CourseStatus = 'ACTIVE' | 'INACTIVE';

export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateCourse = Omit<Course, 'createdAt' | 'updatedAt' | 'id'> & {subjects: Subject[]};

export type UpdateCourse = Omit<Course, 'createdAt' | 'updatedAt'> & {subjects: SubjectWithId[]};

// Edición enviada al back: incluye la lista de asignaturas tal como se cargó,
// para calcular altas, cambios y bajas frente a la lista editada.
export type UpdateCourseCommand = UpdateCourse & {originalSubjects: SubjectWithId[]};