import { useCallback, useState } from 'react';
import { Alert, Box, Drawer } from '@mui/material';
import type { GridPaginationModel } from '@mui/x-data-grid';

import { TeachersHeader } from '../components/TeachersHeader';
import { TeachersFilter } from '../components/TeachersFilter';
import { TeachersTable } from '../components/TeachersTable';
import NewEditTeacherForm from '../components/NewEditTeacherForm';
import { useTeachers } from '../hooks/data-access/useTeachers';
import type { Teacher, UpdateTeacher } from '../../domain/entities/teacher';

export function TeachersPage() {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<UpdateTeacher | undefined>();

  const { data, isLoading, isError } = useTeachers(
    paginationModel.page,
    paginationModel.pageSize,
    search,
  );

  // Al cambiar la búsqueda se vuelve a la primera página.
  const onSearchChange = (value: string) => {
    setSearch(value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const onCreate = () => {
    setEditingTeacher(undefined);
    setOpen(true);
  };

  const onEdit = useCallback((teacher: Teacher) => {
    setEditingTeacher({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
    });
    setOpen(true);
  }, []);

  return (
    <Box>
      <TeachersHeader onCreate={onCreate} />
      <TeachersFilter search={search} onSearchChange={onSearchChange} />

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          No se pudieron cargar los profesores. Inténtalo de nuevo.
        </Alert>
      )}

      <TeachersTable
        teachers={isError ? [] : (data?.items ?? [])}
        loading={isLoading}
        totalRows={isError ? 0 : (data?.totalElements ?? 0)}
        paginationModel={paginationModel}
        onPaginationChange={setPaginationModel}
        onEdit={onEdit}
      />

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        {/* La key separa alta y edición de distintas filas: el formulario se reinicia al cambiar. */}
        <NewEditTeacherForm
          key={editingTeacher?.id ?? 'new'}
          onClose={() => setOpen(false)}
          teacher={editingTeacher}
        />
      </Drawer>
    </Box>
  );
}
