import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface TeachersHeaderProps {
  onCreate: () => void;
}

export function TeachersHeader({ onCreate }: TeachersHeaderProps) {
  return (
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        Profesores
      </Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate} sx={{ textTransform: 'none' }}>
        Nuevo profesor
      </Button>
    </Box>
  );
}
