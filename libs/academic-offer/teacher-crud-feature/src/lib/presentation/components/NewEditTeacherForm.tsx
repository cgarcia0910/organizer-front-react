import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Divider, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import AddCircleOutlined from '@mui/icons-material/AddCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { z } from 'zod';
import { useFieldArray, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { UpdateTeacher } from '../../domain/entities/teacher';
import { PartialSaveError } from '../../application/errors';
import { useCreateTeacher } from '../hooks/data-access/useCreateTeacher';
import { useUpdateTeacher } from '../hooks/data-access/useUpdateTeacher';
import { useCourseOptions } from '../hooks/data-access/useCourseOptions';
import { useTeacherHabilitationRows } from '../hooks/data-access/useTeacherHabilitationRows';
import { TeacherHabilitationsTable } from './TeacherHabilitationsTable';
import { HabilitationRowFields } from './HabilitationRowFields';

interface NewEditTeacherFormProps {
  onClose: () => void;
  /** Sin `teacher` el formulario es de alta; con `teacher` es de edición. */
  teacher?: UpdateTeacher;
}

const habilitationSchema = z.object({
  courseId: z.string().min(1, 'Elige un curso'),
  subjectId: z.string().min(1, 'Elige una asignatura'),
});

export const teacherSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es obligatorio'),
  lastName: z.string().trim().min(1, 'Los apellidos son obligatorios'),
  email: z
    .string()
    .trim()
    .min(1, 'El email es obligatorio')
    .email('Introduce un email válido'),
  habilitations: z.array(habilitationSchema).superRefine((rows, ctx) => {
    const seen = new Set<string>();
    rows.forEach((row, index) => {
      if (!row.courseId || !row.subjectId) return;
      const key = `${row.courseId}:${row.subjectId}`;
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index, 'subjectId'],
          message: 'Esta asignatura ya está en la lista',
        });
      }
      seen.add(key);
    });
  }),
});

export type TeacherFormValues = z.infer<typeof teacherSchema>;

export default function NewEditTeacherForm({ onClose, teacher }: NewEditTeacherFormProps) {
  const createTeacherMutation = useCreateTeacher();
  const updateTeacherMutation = useUpdateTeacher();
  const [saveError, setSaveError] = useState<string | null>(null);
  // Tras crear el profesor pero fallar sus habilitaciones, el formulario pasa a edición de ese profesor.
  const [savedTeacherId, setSavedTeacherId] = useState<string | undefined>();

  const teacherId = teacher?.id ?? savedTeacherId;
  const existing = useTeacherHabilitationRows(teacherId ?? '');
  const coursesQuery = useCourseOptions();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormValues>({
    defaultValues: {
      firstName: teacher?.firstName ?? '',
      lastName: teacher?.lastName ?? '',
      email: teacher?.email ?? '',
      habilitations: [],
    },
    resolver: zodResolver(teacherSchema),
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'habilitations' });

  const onSubmit: SubmitHandler<TeacherFormValues> = async (data) => {
    setSaveError(null);
    try {
      if (teacherId) {
        await updateTeacherMutation.mutateAsync({ id: teacherId, ...data });
      } else {
        await createTeacherMutation.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      if (error instanceof PartialSaveError) {
        setSavedTeacherId(error.teacherId);
        setSaveError(
          `El profesor se guardó, pero sus habilitaciones no: ${error.message}. Vuelve a guardar para reintentarlas.`,
        );
        return;
      }
      setSaveError(
        error instanceof Error
          ? `No se pudo guardar el profesor: ${error.message}`
          : 'No se pudo guardar el profesor. Inténtalo de nuevo.',
      );
    }
  };

  const activeRows = existing.rows ?? [];

  return (
    <Paper elevation={0} sx={{ width: '100%', maxWidth: 640, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {teacherId ? 'Editar profesor' : 'Nuevo profesor'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Introduce los datos del profesor y sus habilitaciones.
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="Cerrar">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <TextField
            label="Nombre *"
            fullWidth
            size="small"
            {...register('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />
          <TextField
            label="Apellidos *"
            fullWidth
            size="small"
            {...register('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
          />
          <TextField
            label="Email *"
            type="email"
            fullWidth
            size="small"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Habilitaciones
        </Typography>

        {teacherId && (
          <Box sx={{ mb: 2 }}>
            {existing.isError ? (
              <Alert severity="error">No se pudieron cargar las habilitaciones existentes.</Alert>
            ) : (
              <TeacherHabilitationsTable rows={activeRows} loading={existing.isLoading} />
            )}
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {teacherId ? 'Nuevas habilitaciones' : 'Habilitaciones del profesor (opcional)'}
        </Typography>

        <Stack spacing={2}>
          {fields.map((field, index) => (
            <HabilitationRowFields
              key={field.id}
              index={index}
              control={control}
              courses={coursesQuery.data ?? []}
              existing={activeRows}
              courseError={errors.habilitations?.[index]?.courseId?.message}
              subjectError={errors.habilitations?.[index]?.subjectId?.message}
              onCourseChange={() => setValue(`habilitations.${index}.subjectId`, '')}
              onRemove={() => remove(index)}
            />
          ))}
        </Stack>

        <Button
          variant="outlined"
          startIcon={<AddCircleOutlined />}
          fullWidth
          onClick={() => append({ courseId: '', subjectId: '' })}
          sx={{ mt: 2, py: 1.5, borderStyle: 'dashed', textTransform: 'none', fontWeight: 600 }}
        >
          Añadir habilitación
        </Button>

        <Divider sx={{ my: 2 }} />

        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" onClick={onClose} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ textTransform: 'none', boxShadow: 'none' }}
          >
            Guardar profesor
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
