import { Box, Paper, Typography } from '@mui/material';

import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { useMemo } from 'react';
import { Course } from '../../domain/entities/courses';
import { getCourseColumns } from '../constants/course-columns';

interface CoursesTableProps {
  courses: Course[];
  loading?: boolean;
  totalRows: number;
  paginationModel: GridPaginationModel;
  onPaginationChange: (model: GridPaginationModel) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

export function CoursesTable({
  courses,
  loading,
  totalRows,
  paginationModel,
  onPaginationChange,
  onEdit,
  onDelete,
}: CoursesTableProps) {
  const columns = useMemo(
    () => getCourseColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );
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
        <Typography variant="subtitle1" fontWeight={600}>
          Listado de cursos
        </Typography>
      </Box>

      <DataGrid
        rows={courses}
        columns={columns}
        loading={loading}
        rowCount={totalRows}
        paginationMode="server"
        sortingMode="server"
        filterMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationChange}
        pageSizeOptions={[5, 10, 25, 50]}
        disableRowSelectionOnClick
        autoHeight
        localeText={{
          noRowsLabel: 'No hay cursos disponibles',
          noResultsOverlayLabel: 'No se encontraron resultados',
          toolbarColumns: 'Columnas',
        }}
        sx={{
          border: 0,

          '& .MuiDataGrid-columnHeaders': {
            bgcolor: 'action.hover',
            fontWeight: 600,
          },

          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
          },

          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
          },

          '& .MuiDataGrid-row:hover': {
            bgcolor: 'action.hover',
          },

          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid',
            borderColor: 'divider',
          },
        }}
      />
    </Paper>
  );
}
