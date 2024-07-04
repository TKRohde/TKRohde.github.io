import { Chess } from 'chess.js';

export function decodeGameState(encodedState) {
  if (typeof encodedState !== 'string' || encodedState.length < 7) {
    throw new Error('Invalid encoded state');
  }

  // Extract game ID
  const gameId = encodedState.slice(0, 6);

  // Extract and decode FEN
  const encodedFen = encodedState.slice(6);
  const fen = atob(encodedFen.replace(/-/g, '+').replace(/_/g, '/'));

  // Create and return Chess instance
  try {
    const chess = new Chess(fen);
    return { gameId, chess };
  } catch (error) {
    console.error('Error creating Chess instance:', error);
    throw new Error('Invalid chess position');
  }
}