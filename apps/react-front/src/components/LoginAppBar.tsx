import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { Dispatch, SetStateAction, useState } from 'react';

interface LoginAppBarProps {
  mobileOpen: boolean;
  setMobileOpen: Dispatch<SetStateAction<boolean>>;
}

const initials = (userName: string) =>
  userName
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export function LoginAppBar({ mobileOpen, setMobileOpen }: LoginAppBarProps) {
  // const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState<null | HTMLElement>(null);
  const userName = 'Juan Pérez';
  const userRole = 'Administrador';
  const handleLogout = () => console.log('logout');
  const handleProfile = () => console.log('profile');
  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: '#172B4D',
      }}
    >
      <Toolbar>
        {/* BOTÓN MENÚ MÓVIL */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={() => setMobileOpen(!mobileOpen)}
          sx={{
            mr: 2,
            display: { md: 'none' },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* NOMBRE APLICACIÓN */}
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 600 }}
        >
          Campus Admin
        </Typography>

        {/* USUARIO */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: { xs: 'none', sm: 'block' },
              textAlign: 'right',
            }}
          >
            <Typography variant="body2">{userName}</Typography>

            <Typography variant="caption" sx={{ color: '#BFC7D5' }}>
              {userRole}
            </Typography>
          </Box>

          <IconButton
            onClick={(event) => setUserMenu(event.currentTarget)}
            color="inherit"
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#3B82F6',
                fontSize: 14,
              }}
            >
              {initials(userName)}
            </Avatar>
          </IconButton>

          {/* MENÚ USUARIO */}
          <Menu
            anchorEl={userMenu}
            open={Boolean(userMenu)}
            onClose={() => setUserMenu(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleProfile}>
              <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
              Mi perfil
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
