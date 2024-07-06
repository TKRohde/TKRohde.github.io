import { v4 as uuidv4 } from 'uuid';

export function generateId() {
  return uuidv4().slice(0, 6);
}

export function encodeGameState(gameId, moveId, fen) {
  const encodedFen = btoa(fen).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${gameId}${moveId}${encodedFen}`;
}