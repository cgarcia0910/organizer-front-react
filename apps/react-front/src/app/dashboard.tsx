
import { useState } from "react";

import {
  Typography,
  Box, CssBaseline,
  Paper
} from "@mui/material";

import { LoginAppBar } from "../components/LoginAppBar";
import { SidebarMenu } from "../components/SidebarMenu";
import { CoursesPage } from "../components/CoursesPage";
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@react-front/login-feature";

const DRAWER_WIDTH = 250;

export function Dashboard() {

  // const [academicOpen, setAcademicOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Cursos");

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>

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
          mt: "64px",
          bgcolor: "#F5F7FA",
          minHeight: "calc(100vh - 64px)",
        }}
      >

        {/* BREADCRUMB */}
        {/* <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {activeSection === "Cursos" ||
          activeSection === "Profesores"
            ? `Oferta académica / ${activeSection}`
            : activeSection}
        </Typography> */}

        {/* TÍTULO */}
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: "#24344D",
          }}
        >
          {activeSection}
        </Typography>

        {/* CONTENIDO */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid #E5E7EB",
            minHeight: 250,
          }}
        >

          <Typography variant="h6" sx={{ mb: 1 }}>
            {activeSection}
          </Typography>
          <Routes>
                  <Route element={<ProtectedRoute />}>
                    <Route path="/academic-offer/courses" element={<CoursesPage />} />
                  </Route>
                </Routes>
          <Typography color="text.secondary">
            Contenido de la sección {activeSection}.
          </Typography>

        </Paper>

      </Box>

    </Box>
  );
}
