import { Chess } from 'chess.js';

export function decodeGameState(encodedState) {
  if (typeof encodedState !== 'string' || encodedState.length < 9) {
    throw new Error('Invalid encoded state');
  }

  // Extract game ID
  const gameId = encodedState.slice(0, 6);

  // Extract and decode FEN
  const encodedFen = encodedState.slice(6, -2);
  const fen = atob(encodedFen.replace(/-/g, '+').replace(/_/g, '/'));

  // Extract game over flag and status
  const isGameOver = encodedState.slice(-2, -1) === '1';
  const gameStatus = encodedState.slice(-1);

  // Create and return Chess instance
  try {
    const chess = new Chess(fen);
    return { gameId, chess, isGameOver, gameStatus };
  } catch (error) {
    console.error('Error creating Chess instance:', error);
    throw new Error('Invalid chess position');
  }
}