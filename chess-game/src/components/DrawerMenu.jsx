import BarChartIcon from '@mui/icons-material/BarChart';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import GamesIcon from '@mui/icons-material/Games';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const DrawerMenu = ({ open, handleDrawerClose, drawerWidth }) => {
  const theme = useTheme();

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: `${theme.mixins.toolbar.minHeight}px`,
          height: `calc(100% - ${theme.mixins.toolbar.minHeight}px)`,
        },
      }}
      variant="temporary"
      anchor="left"
      open={open}
      onClose={handleDrawerClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <List>
        {[
          { text: 'Home', icon: <HomeIcon />, path: '/' },
          { text: 'Games', icon: <GamesIcon />, path: '/games' },
          { text: 'Stats', icon: <BarChartIcon />, path: '/stats' },
          { text: 'About', icon: <InfoIcon />, path: '/about' }
        ].map((item) => (
          <ListItem button key={item.text} component={RouterLink} to={item.path} onClick={handleDrawerClose}>
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default DrawerMenu;