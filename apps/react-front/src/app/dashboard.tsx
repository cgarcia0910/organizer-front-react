import { useState } from 'react';

import { Box, CssBaseline, Paper } from '@mui/material';

import { LoginAppBar } from '../components/LoginAppBar';
import { SidebarMenu } from '../components/SidebarMenu';
import { CoursesPage } from '@react-front/courses-crud-feature';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@react-front/login-feature';

export function Dashboard() {
  // const [academicOpen, setAcademicOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* ================================= */}
      {/* BARRA SUPERIOR */}
      {/* ================================= */}

      <LoginAppBar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* ================================= */}
      {/* MENÚ LATERAL */}
      {/* ================================= */}

      <SidebarMenu mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* ================================= */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ================================= */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: { xs: 2, md: 4 },
          mt: '64px',
          bgcolor: '#F5F7FA',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: '1px solid #E5E7EB',
            minHeight: 250,
          }}
        >
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/academic-offer/courses" element={<CoursesPage />} />
            </Route>
          </Routes>
        </Paper>
      </Box>
    </Box>
  );
}
