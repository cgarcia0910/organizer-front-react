/**
 * El profesor se guardó pero una operación posterior (sus habilitaciones) falló.
 * Lleva el id del profesor para que el formulario pase a edición y un reintento
 * no cree un segundo profesor.
 */
export class PartialSaveError extends Error {
  teacherId: string;

  constructor(teacherId: string, cause: unknown) {
    super(cause instanceof Error ? cause.message : 'error desconocido');
    this.name = 'PartialSaveError';
    this.teacherId = teacherId;
  }
}
