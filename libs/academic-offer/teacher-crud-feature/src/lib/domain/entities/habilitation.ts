export type HabilitationStatus = 'ACTIVE' | 'REVOKED';

export type EffectiveStatusReason = 'TEACHER_INACTIVE' | 'COURSE_INACTIVE' | 'SUBJECT_INACTIVE';

export interface Habilitation {
  id: string;
  teacherId: string;
  courseId: string;
  subjectId: string;
  status: HabilitationStatus;
  /** True sólo si la habilitación está ACTIVE y profesor, curso y asignatura están activos. */
  effective: boolean;
  /** Vacía si effective=true; motivos de inefectividad en caso contrario. */
  effectiveStatusReason: EffectiveStatusReason[];
  createdAt: string;
  updatedAt: string;
  revokedAt: string | null;
}

/** Habilitación lista para mostrar: los nombres se resuelven con los cursos y asignaturas cargados. */
export interface HabilitationRow extends Habilitation {
  courseName: string;
  subjectName: string;
}

/** Una fila del formulario de alta; el payload de la API es exactamente esto. */
export interface HabilitationCreate {
  courseId: string;
  subjectId: string;
}
