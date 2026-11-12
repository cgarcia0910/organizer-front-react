import { InputAdornment, Paper, TextField } from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';

interface TeachersFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function TeachersFilter({ search, onSearchChange }: TeachersFilterProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Buscar por nombre, apellidos o email..."
        value={search}
        onChange={(e) => onSearchChange((e.target as unknown as { value: string }).value)}
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
    </Paper>
  );
}
