import { Chip, IconButton, Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Teacher, TeacherStatus } from '../../domain/entities/teacher';

const TEACHER_STATUS_CHIP: Partial<
  Record<TeacherStatus, { label: string; color: 'success' | 'default' }>
> = {
  ACTIVE: { label: 'Activo', color: 'success' },
  INACTIVE: { label: 'Inactivo', color: 'default' },
};

interface TeacherColumnsHandlers {
  onEdit: (teacher: Teacher) => void;
}

export function getTeacherColumns({ onEdit }: TeacherColumnsHandlers): GridColDef<Teacher>[] {
  return [
    {
      field: 'firstName',
      headerName: 'Nombre',
      minWidth: 150,
      flex: 1,
    },
    {
      field: 'lastName',
      headerName: 'Apellidos',
      minWidth: 180,
      flex: 1.2,
    },
    {
      field: 'email',
      headerName: 'Email',
      minWidth: 220,
      flex: 1.5,
    },
    {
      field: 'status',
      headerName: 'Estado',
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => {
        const statusConfig = TEACHER_STATUS_CHIP[params.value as TeacherStatus];
        const color = statusConfig?.color ?? 'default';
        const label = statusConfig?.label ?? params.value;

        return <Chip label={label} color={color} size="small" variant="outlined" />;
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
            title="Editar profesor"
            aria-label="Editar profesor"
            onClick={() => onEdit(params.row)}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];
}
