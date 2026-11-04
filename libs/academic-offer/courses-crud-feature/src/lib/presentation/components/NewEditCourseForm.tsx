import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { z } from 'zod';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateCourse } from '../hooks/data-access/useCreateCourse';
import { Course } from '../../domain/entities/courses';
import { useUpdateCourse } from '../hooks/data-access/useUpdateCourse';

interface NewEditCourseProps {
  onClose: () => void;
  //   onSave?: (curso: CursoForm) => void;
  course?: Course;
}

export const courseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string(),
  status: z.literal(['ACTIVE', 'INACTIVE']),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

const courseFormDefaultValues: CourseFormValues = {
  name: '',
  code: '',
  description: '',
  status: 'ACTIVE',
};

export default function NewEditCourseForm({
  onClose,
  course,
}: NewEditCourseProps) {
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    defaultValues: course || courseFormDefaultValues,
    resolver: zodResolver(courseSchema),
  });

  const { ref: nameRef, ...nameField } = register('name');
  const { ref: codeRef, ...codeField } = register('code');
  const { ref: descriptionRef, ...descriptionField } = register('description');
  const onSubmit: SubmitHandler<CourseFormValues> = async (data) => {
    console.log(data);
    if (course) {
      updateCourseMutation.mutate({ ...course, ...data });
    } else {
      createCourseMutation.mutate(data);
    }
    onClose();
  };
  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '9px',
      backgroundColor: '#fff',
      fontSize: '14px',
      '& fieldset': {
        borderColor: '#dedede',
      },
      '&:hover fieldset': {
        borderColor: '#bdbdbd',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2859a8',
      },
    },
    '& .MuiInputBase-input': {
      padding: '13px',
    },
  };

  const labelStyles = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#666',
    mb: 0.6,
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 800,
        mx: 'auto',
        p: 1.5,
        border: '1px solid #dedede',
        borderRadius: '12px',
        backgroundColor: '#fff',
      }}
    >
      {/* Cabecera */}
      <Box>
        <Box>
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 600,
              color: '#171717',
              lineHeight: 1.5,
            }}
          >
            Nuevo curso
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              color: '#777',
              mt: 1,
            }}
          >
            Introduce la información del nuevo curso.
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Cerrar"
          sx={{ color: '#666' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        {/* Información general */}
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            mb: 1.8,
            color: '#222',
          }}
        >
          Información general
        </Typography>

        <Box>
          <Box>
            <Typography sx={labelStyles}>Nombre del curso *</Typography>

            <TextField
              {...nameField}
              inputRef={nameRef}
              fullWidth
              size="small"
              placeholder="Nombre del curso"
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={inputStyles}
            />
          </Box>
          <Box>
            <Typography sx={labelStyles}>Codigo *</Typography>

            <TextField
              {...codeField}
              inputRef={codeRef}
              fullWidth
              size="small"
              placeholder="Codigo"
              error={!!errors.code}
              helperText={errors.code?.message}
              sx={inputStyles}
            />
          </Box>

          <Box>
            <Typography sx={labelStyles}>Descripción</Typography>

            <TextField
              {...descriptionField}
              inputRef={descriptionRef}
              fullWidth
              multiline
              rows={2}
              placeholder="Descripción del curso..."
              sx={{
                ...inputStyles,
                '& .MuiInputBase-input': {
                  padding: '13px',
                  lineHeight: 1.5,
                },
              }}
            />
          </Box>
          <Box>
            <Typography sx={labelStyles}>Estado</Typography>

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  fullWidth
                  size="small"
                  sx={inputStyles}
                  {...field}
                >
                  <MenuItem value="ACTIVE">Activo</MenuItem>
                  <MenuItem value="INACTIVE">Inactivo</MenuItem>
                </TextField>
              )}
            />
          </Box>
        </Box>
        {/* Acciones */}
        <Divider sx={{ mt: 2.5, mb: 2.5 }} />

        <Box>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              textTransform: 'none',
              color: '#333',
              borderColor: '#ddd',
              borderRadius: '9px',
              px: 1.5,
              py: 0.8,
              fontSize: 14,
              '&:hover': {
                borderColor: '#aaa',
                backgroundColor: '#f8f8f8',
              },
            }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
            sx={{
              textTransform: 'none',
              backgroundColor: '#2859a8',
              borderRadius: '9px',
              px: 1.5,
              py: 0.8,
              fontSize: 14,
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#204989',
                boxShadow: 'none',
              },
            }}
          >
            Guardar curso
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
