import {
    Box, Chip,
    IconButton, Paper,
    Stack, Typography
} from "@mui/material";

import {
    DataGrid,
    type GridColDef,
    type GridPaginationModel,
} from "@mui/x-data-grid";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import { Course } from "../courses-page";


interface CoursesTableProps {
    courses: Course[];
      loading?: boolean;
      totalRows: number;
      paginationModel: GridPaginationModel;
      onPaginationChange: (model: GridPaginationModel) => void;
      onEdit: (course: Course) => void;
      onDelete: (course: Course) => void;
}


export function CoursesTable({courses, loading, totalRows, paginationModel, onPaginationChange, onEdit, onDelete}: CoursesTableProps) {
      const columns: GridColDef<Course>[] = [
        {
          field: "code",
          headerName: "Código",
          minWidth: 120,
          flex: 0.7,
        },
        {
          field: "name",
          headerName: "Nombre del curso",
          minWidth: 200,
          flex: 1.5,
          renderCell: (params) => (
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {params.row.name}
              </Typography>
    
              {params.row.description && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                >
                  {params.row.description}
                </Typography>
              )}
            </Box>
          ),
        },
        {
          field: "modality",
          headerName: "Modalidad",
          minWidth: 130,
          flex: 0.8,
        },
        {
          field: "duration",
          headerName: "Duración",
          minWidth: 110,
          flex: 0.6,
          valueFormatter: (value) => `${value} horas`,
        },
        {
          field: "status",
          headerName: "Estado",
          minWidth: 120,
          flex: 0.7,
          renderCell: (params) => {
            const color =
              params.value === "Activo"
                ? "success"
                : params.value === "Borrador"
                  ? "warning"
                  : "default";
    
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
          field: "actions",
          headerName: "Acciones",
          sortable: false,
          filterable: false,
          disableColumnMenu: true,
          width: 110,
          align: "right",
          headerAlign: "right",
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
    return (
        <Paper
        elevation={0}
        sx={{
          width: "100%",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
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
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationChange}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight
          localeText={{
            noRowsLabel: "No hay cursos disponibles",
            noResultsOverlayLabel: "No se encontraron resultados",
            toolbarColumns: "Columnas",
          }}
          sx={{
            border: 0,

            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "action.hover",
              fontWeight: 600,
            },

            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600,
            },

            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },

            "& .MuiDataGrid-row:hover": {
              bgcolor: "action.hover",
            },

            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid",
              borderColor: "divider",
            },
          }}
        />
      </Paper>
    )
}