export type Subject = {
    code: string,
    name: string,
    hoursPerWeek: number,
    maxHoursPerDay: number,
}

// Asignatura existente con su identificador. Las nuevas no lo llevan.
export type SubjectWithId = Subject & { id?: string };