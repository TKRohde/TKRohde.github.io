import { Chess } from 'chess.js';

function generateGameId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function encodeGameState(chess) {
  if (!(chess instanceof Chess)) {
    throw new Error('Invalid chess instance');
  }

  const gameId = generateGameId();
  const fen = chess.fen();
  
  // URL-safe Base64 encoding
  const encodedFen = btoa(fen).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  
  return `${gameId}${encodedFen}`;
}