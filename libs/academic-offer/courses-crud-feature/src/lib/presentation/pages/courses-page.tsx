import { Box, Drawer } from '@mui/material';

import { CoursesHeader } from '../components/CoursesHeader';
import { CoursesFilter } from '../components/CoursesFilters';
import { CoursesTable } from '../components/CoursesTable';
import { useCourses } from '../hooks/data-access/useCourses';
import { useState } from 'react';
import NewEditCourseForm from '../components/NewEditCourseForm';
import { Course, UpdateCourse } from '../../domain/entities/courses';
import { getCourseSubjects } from '../../application/use-cases/get-course-subjects';

interface PaginationModel {
  page: number;
  pageSize: number;
}

// interface CoursesPageProps {
//   onStatusChange: (value: string) => void;
//   statusFilter: string;
//   onDelete: (course: Course) => void;
//   onCreate: () => void;
// }

export function CoursesPage() {
//   {
//   statusFilter = '',
//   onStatusChange,
//   onDelete,
// }: CoursesPageProps) {
  const [paginationModel, onPaginationChange] = useState<PaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [search, onSearchChange] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<UpdateCourse | undefined>();
  const [statusFilter, onStatusChange] = useState<string>()
  const { data, isLoading } = useCourses(
    paginationModel.page,
    paginationModel.pageSize,
    search,
  );

  const onCreate = () => {
    setEditingCourse(undefined);
    setOpen(true);
  };

  const onEdit = async (course: UpdateCourse) => {
    const subjects = await getCourseSubjects(course.id)
    setEditingCourse({...course, subjects: subjects.items});
    setOpen(true);
  };

  const onDelete = (course: Course) => {
    console.log('delete', course)
  }

  return (
    <Box>
      <CoursesHeader onCreate={onCreate} />
      <CoursesFilter
        search={search}
        statusFilter={statusFilter ?? ''}
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
      />
      <CoursesTable
        courses={data?.items as Course[]}
        loading={isLoading}
        totalRows={data?.totalElements ?? 0}
        paginationModel={paginationModel}
        onPaginationChange={onPaginationChange}
        onEdit={onEdit}
        onDelete={onDelete}
      ></CoursesTable>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <NewEditCourseForm
          onClose={() => setOpen(false)}
          course={editingCourse}
        />
      </Drawer>
    </Box>
  );
}
