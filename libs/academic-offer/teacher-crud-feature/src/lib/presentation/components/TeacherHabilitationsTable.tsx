import { useMemo } from 'react';
import { Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { HabilitationRow } from '../../domain/entities/habilitation';
import { getTeacherHabilitationColumns } from '../constants/teacher-habilitation-columns';

interface TeacherHabilitationsTableProps {
  rows: HabilitationRow[];
  loading?: boolean;
}

/** Sólo lectura y sin paginación: la primera página de la API (hasta 50) se muestra entera. */
export function TeacherHabilitationsTable({ rows, loading }: TeacherHabilitationsTableProps) {
  const columns = useMemo(() => getTeacherHabilitationColumns(), []);

  return (
    <Paper
      elevation={0}
      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        hideFooter
        disableRowSelectionOnClick
        autoHeight
        localeText={{ noRowsLabel: 'Este profesor no tiene habilitaciones' }}
        sx={{ border: 0 }}
      />
    </Paper>
  );
}
