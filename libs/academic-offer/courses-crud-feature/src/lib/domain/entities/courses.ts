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

export type CreateCourse = Omit<Course, 'createdAt' | 'updatedAt' | 'id'>;
