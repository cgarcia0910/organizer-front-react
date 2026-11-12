import { useMemo } from 'react';
import { Box, Button, MenuItem, Paper, Stack, TextField } from '@mui/material';
import { Controller, useWatch, type Control } from 'react-hook-form';

import type { HabilitationRow } from '../../domain/entities/habilitation';
import { useCourseSubjects } from '../hooks/data-access/useCourseSubjects';

import type { TeacherFormValues } from './NewEditTeacherForm';

interface HabilitationRowFieldsProps {
  index: number;
  control: Control<TeacherFormValues>;
  courses: { id: string; name: string }[];
  /** Habilitaciones existentes: sus pares curso-asignatura activos no se ofrecen de nuevo. */
  existing: HabilitationRow[];
  courseError?: string;
  subjectError?: string;
  onCourseChange: () => void;
  onRemove: () => void;
}

/** Una fila de nueva habilitación: selector de curso y, debajo, de asignatura de ese curso. */
export function HabilitationRowFields({
  index,
  control,
  courses,
  existing,
  courseError,
  subjectError,
  onCourseChange,
  onRemove,
}: HabilitationRowFieldsProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Controller
          name={`habilitations.${index}.courseId`}
          control={control}
          render={({ field }) => (
            <TextField
              select
              label="Curso *"
              size="small"
              fullWidth
              value={field.value}
              onChange={(e) => {
                field.onChange((e.target as unknown as { value: string }).value);
                onCourseChange();
              }}
              onBlur={field.onBlur}
              inputRef={field.ref}
              error={!!courseError}
              helperText={courseError}
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <SubjectSelect
          index={index}
          control={control}
          existing={existing}
          error={subjectError}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button color="error" size="small" onClick={onRemove} sx={{ textTransform: 'none' }}>
            Quitar habilitación
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}

interface SubjectSelectProps {
  index: number;
  control: Control<TeacherFormValues>;
  existing: HabilitationRow[];
  error?: string;
}

function SubjectSelect({ index, control, existing, error }: SubjectSelectProps) {
  const courseId = useWatch({ control, name: `habilitations.${index}.courseId` });
  const subjectsQuery = useCourseSubjects(courseId || undefined);

  const options = useMemo(() => {
    const active = new Set(
      existing
        .filter((h) => h.status === 'ACTIVE')
        .map((h) => `${h.courseId}:${h.subjectId}`),
    );
    return (subjectsQuery.data ?? []).filter(
      (s) => s.id && !active.has(`${courseId}:${s.id}`),
    );
  }, [subjectsQuery.data, existing, courseId]);

  return (
    <Controller
      name={`habilitations.${index}.subjectId`}
      control={control}
      render={({ field }) => (
        <TextField
          select
          label="Asignatura *"
          size="small"
          fullWidth
          disabled={!courseId}
          value={field.value}
          onChange={(e) => field.onChange((e.target as unknown as { value: string }).value)}
          onBlur={field.onBlur}
          inputRef={field.ref}
          error={!!error}
          helperText={error}
        >
          {options.map((subject) => (
            <MenuItem key={subject.id} value={subject.id}>
              {subject.name}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
