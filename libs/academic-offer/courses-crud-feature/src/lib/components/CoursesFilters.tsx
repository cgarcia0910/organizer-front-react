import {
    InputAdornment,
    MenuItem,
    Paper,
    Stack,
    TextField
} from "@mui/material";


import SearchIcon from "@mui/icons-material/Search";

interface CoursesFilterProps {
      search: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function CoursesFilter({search, statusFilter, onSearchChange, onStatusChange}: CoursesFilterProps) {
    return(
        <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            select
            size="small"
            label="Estado"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            sx={{ minWidth: { sm: 180 } }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="Activo">Activo</MenuItem>
            <MenuItem value="Borrador">Borrador</MenuItem>
            <MenuItem value="Inactivo">Inactivo</MenuItem>
          </TextField>
        </Stack>
      </Paper>
    )
}