import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Divider, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { z } from 'zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { UpdateTeacher } from '../../domain/entities/teacher';
import { useCreateTeacher } from '../hooks/data-access/useCreateTeacher';
import { useUpdateTeacher } from '../hooks/data-access/useUpdateTeacher';

interface NewEditTeacherFormProps {
  onClose: () => void;
  /** Sin `teacher` el formulario es de alta; con `teacher` es de edición. */
  teacher?: UpdateTeacher;
}

export const teacherSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es obligatorio'),
  lastName: z.string().trim().min(1, 'Los apellidos son obligatorios'),
  email: z
    .string()
    .trim()
    .min(1, 'El email es obligatorio')
    .email('Introduce un email válido'),
});

export type TeacherFormValues = z.infer<typeof teacherSchema>;

const emptyValues: TeacherFormValues = { firstName: '', lastName: '', email: '' };

export default function NewEditTeacherForm({ onClose, teacher }: NewEditTeacherFormProps) {
  const createTeacherMutation = useCreateTeacher();
  const updateTeacherMutation = useUpdateTeacher();
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormValues>({
    defaultValues: teacher
      ? { firstName: teacher.firstName, lastName: teacher.lastName, email: teacher.email }
      : emptyValues,
    resolver: zodResolver(teacherSchema),
  });

  const onSubmit: SubmitHandler<TeacherFormValues> = async (data) => {
    setSaveError(null);
    try {
      if (teacher) {
        await updateTeacherMutation.mutateAsync({ id: teacher.id, ...data });
      } else {
        await createTeacherMutation.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? `No se pudo guardar el profesor: ${error.message}`
          : 'No se pudo guardar el profesor. Inténtalo de nuevo.',
      );
    }
  };

  return (
    <Paper elevation={0} sx={{ width: '100%', maxWidth: 480, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {teacher ? 'Editar profesor' : 'Nuevo profesor'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Introduce los datos del profesor.
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

        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}

        <Stack direction="row" spacing={1} justifyContent="flex-end">
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
        </Stack>
      </Box>
    </Paper>
  );
}
