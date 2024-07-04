import { Paper, Typography } from '@mui/material';
import React from 'react';

const GameStatus = ({ status }) => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        my: 2, 
        py: 1, 
        px: 2, 
        display: 'inline-block', 
        backgroundColor: status.includes('White') ? '#f5f5f5' : '#424242',
        color: status.includes('White') ? 'black' : 'white'
      }}
    >
      <Typography variant="h6">
        {status}
      </Typography>
    </Paper>
  );
};

export default GameStatus;