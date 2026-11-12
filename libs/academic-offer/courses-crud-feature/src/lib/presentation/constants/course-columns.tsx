import { Box, Chip, IconButton, Stack, Typography } from '@mui/material';

import { type GridColDef } from '@mui/x-data-grid';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import { Course } from '../../domain/entities/courses';

interface CourseColumnsHandlers {
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

export function getCourseColumns({
  onEdit,
  onDelete,
}: CourseColumnsHandlers): GridColDef<Course>[] {
  return [
    {
      field: 'code',
      headerName: 'Código',
      minWidth: 120,
      flex: 0.7,
    },
    {
      field: 'name',
      headerName: 'Nombre del curso',
      minWidth: 200,
      flex: 1.5,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.row.name}
          </Typography>

          {params.row.description && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'modality',
      headerName: 'Modalidad',
      minWidth: 130,
      flex: 0.8,
    },
    {
      field: 'duration',
      headerName: 'Duración',
      minWidth: 110,
      flex: 0.6,
      valueFormatter: (value) => `${value} horas`,
    },
    {
      field: 'status',
      headerName: 'Estado',
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => {
        const color =
          params.value === 'Activo'
            ? 'success'
            : params.value === 'Borrador'
              ? 'warning'
              : 'default';

        return (
          <Chip
            label={params.value}
            color={color}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      width: 110,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            title="Editar curso"
            onClick={() => onEdit(params.row)}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            color="error"
            title="Eliminar curso"
            onClick={() => onDelete(params.row)}
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];
}
