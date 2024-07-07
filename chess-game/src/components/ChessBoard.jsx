import { Box, useTheme } from '@mui/material';
import { Chess } from 'chess.js';
import React from 'react';
import { Chessboard } from 'react-chessboard';

const ChessBoard = ({ fen, onMove, disabled, darkMode, isMobile }) => {
  const game = new Chess(fen);
  const theme = useTheme();

  const onDrop = (sourceSquare, targetSquare) => {
    if (disabled) return false;

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to queen for simplicity
    };

    try {
      const result = game.move(move);
      if (result) {
        onMove(move);
        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
    return false;
  };

  const boardWidth = isMobile ? Math.min(window.innerWidth - 32, 350) : 400;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: `${boardWidth}px`,
        margin: 'auto',
      }}
    >
      <Chessboard 
        position={fen} 
        onPieceDrop={onDrop}
        boardWidth={boardWidth}
        areArrowsAllowed={true}
        showBoardNotation={true}
        customDarkSquareStyle={{ backgroundColor: darkMode ? '#769656' : '#b58863' }}
        customLightSquareStyle={{ backgroundColor: darkMode ? '#eeeed2' : '#f0d9b5' }}
        customBoardStyle={{
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[3],
        }}
      />
    </Box>
  );
};

export default ChessBoard;