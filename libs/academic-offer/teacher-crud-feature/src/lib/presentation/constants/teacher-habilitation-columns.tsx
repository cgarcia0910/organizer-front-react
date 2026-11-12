import { Chip } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import type { EffectiveStatusReason, HabilitationRow } from '../../domain/entities/habilitation';

const STATUS_CHIP = {
  ACTIVE: { label: 'Activa', color: 'success' },
  REVOKED: { label: 'Revocada', color: 'default' },
} as const;

const REASON_LABEL: Record<EffectiveStatusReason, string> = {
  TEACHER_INACTIVE: 'Profesor inactivo',
  COURSE_INACTIVE: 'Curso inactivo',
  SUBJECT_INACTIVE: 'Asignatura inactiva',
};

export function getTeacherHabilitationColumns(): GridColDef<HabilitationRow>[] {
  return [
    {
      field: 'courseName',
      headerName: 'Curso',
      minWidth: 180,
      flex: 1.2,
    },
    {
      field: 'subjectName',
      headerName: 'Asignatura',
      minWidth: 180,
      flex: 1.2,
    },
    {
      field: 'status',
      headerName: 'Estado',
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => {
        const config = STATUS_CHIP[params.value as keyof typeof STATUS_CHIP];
        return (
          <Chip
            label={config?.label ?? params.value}
            color={config?.color ?? 'default'}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'effective',
      headerName: 'Efectiva',
      minWidth: 220,
      flex: 1,
      renderCell: (params) => {
        if (params.value) return 'Sí';
        const reasons = (params.row.effectiveStatusReason ?? []) as EffectiveStatusReason[];
        const text = reasons.map((r) => REASON_LABEL[r] ?? r).join(', ');
        return text ? `No (${text})` : 'No';
      },
    },
  ];
}
