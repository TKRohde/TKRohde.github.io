import BarChartIcon from '@mui/icons-material/BarChart';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import GamesIcon from '@mui/icons-material/Games';
import InfoIcon from '@mui/icons-material/Info';
import {
    Box,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const drawerWidth = 240;

const DrawerMenu = ({ open, handleDrawerClose }) => {
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <List>
        {[
          { text: 'Home', icon: <GamesIcon />, path: '/' },
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