import { Box, Button, Stack, Typography } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

interface CoursesHeaderProps {
  onCreate: () => void;
}

export function CoursesHeader({ onCreate }: CoursesHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{
        mb: 3,
        justifyContent: 'space-between',
        alignItems: 'baseline',
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight={600}>
          Cursos
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Gestiona el catálogo de cursos académicos.
        </Typography>
      </Box>

      <Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
          Nuevo curso
        </Button>
      </Box>
    </Stack>
  );
}
