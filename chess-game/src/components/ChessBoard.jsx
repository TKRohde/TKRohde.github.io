import { Box } from '@mui/material';
import { Chess } from 'chess.js';
import React from 'react';
import { Chessboard } from 'react-chessboard';

const ChessBoard = ({ fen, onMove, disabled, darkMode }) => {
  const game = new Chess(fen);

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

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '400px',
        margin: 'auto',
      }}
    >
      <Chessboard 
        position={fen} 
        onPieceDrop={onDrop}
        boardWidth={400}
        areArrowsAllowed={true}
        showBoardNotation={true}
        customDarkSquareStyle={{ backgroundColor: darkMode ? '#769656' : '#b58863' }}
        customLightSquareStyle={{ backgroundColor: darkMode ? '#eeeed2' : '#f0d9b5' }}
      />
    </Box>
  );
};

export default ChessBoard;