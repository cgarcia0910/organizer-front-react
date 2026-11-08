import { Box, Chip, IconButton, Stack, Typography } from '@mui/material';

import { type GridColDef } from '@mui/x-data-grid';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import { Course, CourseStatus } from '../../domain/entities/courses';

const COURSE_STATUS_CHIP: Partial<
  Record<CourseStatus, { label: string; color: 'success' | 'default' }>
> = {
  ACTIVE: { label: 'Activo', color: 'success' },
  INACTIVE: { label: 'Inactivo', color: 'default' },
};

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
      field: 'status',
      headerName: 'Estado',
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => {
        const statusConfig = COURSE_STATUS_CHIP[params.value as CourseStatus];
        const color = statusConfig?.color ?? 'default';
        const label = statusConfig?.label ?? params.value;

        return (
          <Chip
            label={label}
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
