import { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { Teacher } from '../../domain/entities/teacher';
import { getTeacherColumns } from '../constants/teacher-columns';

interface TeachersTableProps {
  teachers: Teacher[];
  loading?: boolean;
  totalRows: number;
  paginationModel: GridPaginationModel;
  onPaginationChange: (model: GridPaginationModel) => void;
  onEdit: (teacher: Teacher) => void;
}

export function TeachersTable({
  teachers,
  loading,
  totalRows,
  paginationModel,
  onPaginationChange,
  onEdit,
}: TeachersTableProps) {
  const columns = useMemo(() => getTeacherColumns({ onEdit }), [onEdit]);

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Listado de profesores
        </Typography>
      </Box>

      <DataGrid
        rows={teachers}
        columns={columns}
        loading={loading}
        rowCount={totalRows}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationChange}
        pageSizeOptions={[5, 10, 25, 50]}
        disableRowSelectionOnClick
        autoHeight
        localeText={{
          noRowsLabel: 'No hay profesores disponibles',
          noResultsOverlayLabel: 'No se encontraron resultados',
          toolbarColumns: 'Columnas',
        }}
        sx={{ border: 0 }}
      />
    </Paper>
  );
}
