import { Dispatch, SetStateAction, useState } from 'react';

import {
  Typography,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SettingsIcon from '@mui/icons-material/Settings';

interface SidebarMenuProps {
  mobileOpen: boolean;
  setMobileOpen: Dispatch<SetStateAction<boolean>>;
}

const DRAWER_WIDTH = 250;

export function SidebarMenu({ mobileOpen, setMobileOpen }: SidebarMenuProps) {
  const [academicOpen, setAcademicOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('Cursos');
  // const [mobileOpen, setMobileOpen] = useState(false);

  // Cambiar sección
  const handleNavigation = (section: string) => {
    setActiveSection(section);
    setMobileOpen(false);
  };
  const drawerContent = (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="caption"
        sx={{
          px: 3,
          color: 'text.secondary',
          fontWeight: 600,
          letterSpacing: 1,
        }}
      >
        MENÚ PRINCIPAL
      </Typography>

      <List>
        {/* DASHBOARD */}
        <ListItemButton
          selected={activeSection === 'Dashboard'}
          onClick={() => handleNavigation('Dashboard')}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>

          <ListItemText primary="Dashboard" />
        </ListItemButton>

        {/* OFERTA ACADÉMICA */}
        <ListItemButton onClick={() => setAcademicOpen(!academicOpen)}>
          <ListItemIcon>
            <MenuBookIcon />
          </ListItemIcon>

          <ListItemText primary="Oferta académica" />

          {academicOpen ? <ExpandMoreIcon /> : <ChevronRightIcon />}
        </ListItemButton>

        {/* SUBMENÚS */}
        <Collapse in={academicOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* CURSOS */}
            <ListItemButton
              sx={{ pl: 5 }}
              selected={activeSection === 'Cursos'}
              onClick={() => handleNavigation('Cursos')}
            >
              <ListItemText primary="Cursos" />
            </ListItemButton>

            {/* PROFESORES */}
            <ListItemButton
              sx={{ pl: 5 }}
              selected={activeSection === 'Profesores'}
              onClick={() => handleNavigation('Profesores')}
            >
              <ListItemIcon sx={{ minWidth: 35 }}>
                <PeopleIcon fontSize="small" />
              </ListItemIcon>

              <ListItemText primary="Profesores" />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 2 }} />

        {/* CONFIGURACIÓN */}
        <ListItemButton
          selected={activeSection === 'Configuración'}
          onClick={() => handleNavigation('Configuración')}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>

          <ListItemText primary="Configuración" />
        </ListItemButton>
      </List>
    </Box>
  );
  return (
    <Box
      component="nav"
      sx={{
        width: { md: DRAWER_WIDTH },
        flexShrink: { md: 0 },
      }}
    >
      {/* DRAWER MÓVIL */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* DRAWER ESCRITORIO */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },

          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            top: '64px',
            height: 'calc(100% - 64px)',
            borderRight: '1px solid #E5E7EB',
            bgcolor: '#FFFFFF',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
