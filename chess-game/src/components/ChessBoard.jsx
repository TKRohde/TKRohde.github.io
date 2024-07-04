import { Chess } from 'chess.js';
import React from 'react';
import { Chessboard } from 'react-chessboard';

const ChessBoard = ({ fen, onMove }) => {
  const game = new Chess(fen);

  const onDrop = (sourceSquare, targetSquare) => {
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
    <div style={{ width: '400px', margin: 'auto' }}>
      <Chessboard 
        position={fen} 
        onPieceDrop={onDrop}
        boardWidth={400}
      />
    </div>
  );
};

export default ChessBoard;