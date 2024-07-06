export function decodeGameState(encodedState) {
  if (typeof encodedState !== 'string' || encodedState.length < 12) {
    throw new Error('Invalid encoded state');
  }

  const gameId = encodedState.slice(0, 6);
  const moveId = encodedState.slice(6, 12);
  const encodedFen = encodedState.slice(12);
  const fen = atob(encodedFen.replace(/-/g, '+').replace(/_/g, '/'));

  return { gameId, moveId, fen };
}