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
  InputAdornment,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { z } from 'zod';
import { Controller, useFieldArray, useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateCourse } from '../hooks/data-access/useCreateCourse';
import { Course } from '../../domain/entities/courses';
import { useUpdateCourse } from '../hooks/data-access/useUpdateCourse';

import {
  AddCircleOutlined,
  DeleteOutlined,
  MenuBook,
  AccessTime
} from "@mui/icons-material";

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
  subjects: z.array(
      z.object({
        name: z
          .string()
          .trim()
          .min(1, "El nombre de la asignatura es obligatorio"),

        code: z
          .string()
          .trim()
          .min(1, "El codigo de la asignatura es obligatorio"),
        
        hoursPerWeek: z
          .number({
            error: "Introduce el número de horas"
          })
          .int("Las horas deben ser un número entero")
          .min(1, "Debe tener al menos una hora"),

        maxHoursPerDay: z
          .number({
            error: "Introduce el número de horas"
          })
          .int("Las horas deben ser un número entero")
          .min(1, "Debe tener al menos una hora")
      })
    )
    .min(1, "Debes añadir al menos una asignatura")
});

export type CourseFormValues = z.infer<typeof courseSchema>;

const courseFormDefaultValues: CourseFormValues = {
  name: '',
  code: '',
  description: '',
  status: 'ACTIVE',
  subjects: [
    {
      name: "",
      code: '',
      hoursPerWeek: 1,
      maxHoursPerDay: 1,
    }
  ]
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

  const {
    fields,
    append,
    remove
  } = useFieldArray({
    control,
    name: "subjects"
  });

  const { ref: nameRef, ...nameField } = register('name');
  const { ref: codeRef, ...codeField } = register('code');
  const { ref: descriptionRef, ...descriptionField } = register('description');
  const onSubmit: SubmitHandler<CourseFormValues> = async (data) => {
    if (course) {
      updateCourseMutation.mutate({ ...course, ...data });
    } else {
      createCourseMutation.mutate(data);
    }
    onClose();
  };
  const subjects = useWatch({
    control,
    name: 'subjects'
  })
  const totalHours = (subjects || []).reduce(
    (total, item) => total + (Number(item?.hoursPerWeek) || 0),
    0
  );
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

<Divider sx={{ my: 1 }} />

      {/* ASIGNATURAS */}

      <Box sx={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
      }}>
        <Typography sx={{variant:"h6", fontWeight:700}}>
          Asignaturas del curso
        </Typography>

        <Typography sx={{variant:"caption", color:"text.secondary"}}>
          {fields.length} asignaturas
        </Typography>
      </Box>

      <Typography sx={{variant:"body2", color:"text.secondary"}}>
        Añade las asignaturas que forman parte del curso
        e indica sus horas lectivas.
      </Typography>

      <Stack spacing={2}>

        {fields.map((field, index) => (

          <Paper
            key={field.id}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2
            }}
          >

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2
              }}
            >
              <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                <MenuBook color="primary" />

                <Typography sx={{fontWeight: 600}}>
                  Asignatura {index + 1}
                </Typography>
              </Box>

              <IconButton sx={{
                color:"error",
                size:"small"
              }}
                disabled={fields.length === 1}
                onClick={() => remove(index)}
              >
                <DeleteOutlined />
              </IconButton>

            </Box>

            <Stack spacing={2}>

              {/* NOMBRE */}

              <TextField
                label="Nombre de la asignatura"
                placeholder="Ej. Matemáticas"
                fullWidth
                {...register(`subjects.${index}.name`)}
                error={
                  !!errors.subjects?.[index]?.name
                }
                helperText={
                  errors.subjects?.[index]?.name?.message
                }
              />

              <TextField
                label="Codigo de la asignatura"
                placeholder="Ej: Mat"
                fullWidth
                {...register(`subjects.${index}.code`)}
                error={
                  !!errors.subjects?.[index]?.code
                }
                helperText={
                  errors.subjects?.[index]?.code?.message
                }
              />

              {/* HORAS */}

              <TextField
                label="Número de horas por semana"
                placeholder="Ej. 60"
                type="number"
                fullWidth
                {...register(`subjects.${index}.hoursPerWeek`, {
                  valueAsNumber: true
                })}
                error={
                  !!errors.subjects?.[index]?.hoursPerWeek
                }
                helperText={
                  errors.subjects?.[index]?.hoursPerWeek?.message
                }
                slotProps={{
                  htmlInput: {
                    min: 1,
                    step: 1
                  },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <AccessTime fontSize="small" />
                        h
                      </InputAdornment>
                    )
                  }
                }}
              />

              <TextField
                label="Maximo horas al dia"
                placeholder="Ej. 60"
                type="number"
                fullWidth
                {...register(`subjects.${index}.maxHoursPerDay`, {
                  valueAsNumber: true
                })}
                error={
                  !!errors.subjects?.[index]?.maxHoursPerDay
                }
                helperText={
                  errors.subjects?.[index]?.maxHoursPerDay?.message
                }
                slotProps={{
                  htmlInput: {
                    min: 1,
                    step: 1
                  },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <AccessTime fontSize="small" />
                        h
                      </InputAdornment>
                    )
                  }
                }}
              />

            </Stack>

          </Paper>

        ))}

      </Stack>

      {/* AÑADIR */}

      <Button
        variant="outlined"
        startIcon={<AddCircleOutlined />}
        fullWidth
        onClick={() =>
          append({
            name: "",
            hoursPerWeek: 1,
            maxHoursPerDay: 1,
          })
        }
        sx={{
          py: 1.5,
          borderStyle: "dashed",
          textTransform: "none",
          fontWeight: 600
        }}
      >
        Añadir asignatura
      </Button>

      {/* RESUMEN */}

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: "action.hover"
        }}
      >

        <Stack spacing={1}>

          <Box sx={{display:"flex", justifyContent:"space-between"}}>
            <Typography color="text.secondary">
              Total de asignaturas
            </Typography>

            <Typography sx={{fontWeight: 600}}>
              {fields.length}
            </Typography>
          </Box>

          <Box
            sx = {{display:"flex",
            justifyContent:"space-between",
            alignItems:"center"}}
          >
            <Typography color="text.secondary">
              Total de horas
            </Typography>

            <Typography sx={{variant:"h5", color:"primary", fontWeight:700}}>
              {totalHours} h
            </Typography>
          </Box>

        </Stack>

      </Paper>

      <Divider sx={{ my: 1 }} />


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
