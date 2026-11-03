import {
    Box, Chip,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";

import {
    DataGrid,
    type GridColDef,
    type GridPaginationModel,
} from "@mui/x-data-grid";

import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { CoursesHeader } from "./components/CoursesHeader";
import { CoursesFilter } from "./components/CoursesFilters";
import { CoursesTable } from "./components/CoursesTable";

export interface Course {
  id: number | string;
  code: string;
  name: string;
  description?: string;
  modality: string;
  duration: number;
  status: "Activo" | "Borrador" | "Inactivo";
}

interface CoursesPageProps {
  courses: Course[];
  loading?: boolean;
  totalRows: number;
  paginationModel: GridPaginationModel;
  onPaginationChange: (model: GridPaginationModel) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;

  search: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;


  onCreate: () => void;
}

export function CoursesPage({
  courses = [{id: 1, code: '1', name: 'curso1', description: 'curso', modality: 'online', duration: 2333, status: 'Activo'},{id: 1, code: '1', name: 'curso1', description: 'curso', modality: 'online', duration: 2333, status: 'Activo'},{id: 1, code: '1', name: 'curso1', description: 'curso', modality: 'online', duration: 2333, status: 'Activo'},{id: 1, code: '1', name: 'curso1', description: 'curso', modality: 'online', duration: 2333, status: 'Activo'},{id: 1, code: '1', name: 'curso1', description: 'curso', modality: 'online', duration: 2333, status: 'Activo'},{id: 1, code: '1', name: 'curso1', description: 'curso', modality: 'online', duration: 2333, status: 'Activo'},{id: 1, code: '1', name: 'curso1', description: 'curso', modality: 'online', duration: 2333, status: 'Activo'},{id: 1, code: '1', name: 'curso1', description: 'curso', modality: 'online', duration: 2333, status: 'Activo'},{id: 1, code: '1', name: 'curso1', description: 'curso', modality: 'online', duration: 2333, status: 'Activo'},{id: 1, code: '1', name: 'curso1', description: 'curso', modality: 'online', duration: 2333, status: 'Activo'}],
  loading = false,
  totalRows = 0,
  paginationModel = {
    page: 0,
    pageSize: 10,
  },
  onPaginationChange,
  search = "",
  statusFilter = "",
  onSearchChange,
  onStatusChange,
  onCreate,
  onEdit,
  onDelete,
}: CoursesPageProps) {
  return (
    <Box>
        <CoursesHeader onCreate={onCreate}/>
      {/* FILTROS */}
      <CoursesFilter search={search} statusFilter={statusFilter} onSearchChange={onSearchChange} onStatusChange={onStatusChange} />

      {/* DATA GRID */}
      <CoursesTable courses={courses} loading={loading} totalRows={totalRows} paginationModel={paginationModel} onPaginationChange={onPaginationChange} onEdit={onEdit} onDelete={onDelete}></CoursesTable>

    </Box>
  );
}
