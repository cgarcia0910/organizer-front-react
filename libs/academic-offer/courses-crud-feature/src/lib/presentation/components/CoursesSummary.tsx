import { Box, Paper, Stack, Typography } from '@mui/material';

import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

export function CoursesSummary() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
      <SummaryCard
        title="Total cursos"
        value={totalRows}
        icon={<MenuBookOutlinedIcon />}
      />

      <SummaryCard
        title="Cursos activos"
        value={courses.filter((c) => c.status === 'Activo').length}
        color="success.main"
      />

      <SummaryCard
        title="Borradores"
        value={courses.filter((c) => c.status === 'Borrador').length}
        color="warning.main"
      />
    </Stack>
  );
}

// TARJETA DE RESUMEN
interface SummaryCardProps {
  title: string;
  value: number;
  color?: string;
  icon?: React.ReactNode;
}

function SummaryCard({
  title,
  value,
  color = 'primary.main',
  icon,
}: SummaryCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        p: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>

          <Typography
            variant="h4"
            fontWeight={600}
            color={color}
            sx={{ mt: 1 }}
          >
            {value}
          </Typography>
        </Box>

        {icon && <Box sx={{ color: 'primary.main', opacity: 0.7 }}>{icon}</Box>}
      </Stack>
    </Paper>
  );
}
