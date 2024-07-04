// generateWinningUrl.js

const { Chess } = require('chess.js');

function generateGameId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function encodeGameState(chess) {
  const gameId = generateGameId();
  const fen = chess.fen();
  const isGameOver = chess.isGameOver() ? '1' : '0';
  const gameStatus = chess.isCheckmate() ? 'c' : 
                     chess.isDraw() ? 'd' :
                     chess.isStalemate() ? 's' :
                     chess.isThreefoldRepetition() ? 't' :
                     chess.isInsufficientMaterial() ? 'i' : 'o'; // 'o' for ongoing
  
  // URL-safe Base64 encoding
  const encodedFen = Buffer.from(fen).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  
  return `${gameId}${encodedFen}${isGameOver}${gameStatus}`;
}

// Set up a chess board with a checkmate scenario (Fool's Mate)
const chess = new Chess();
chess.move('f3');
chess.move('e5');
chess.move('g4');
chess.move('Qh4#');

// Encode the game state
const encodedState = encodeGameState(chess);

// Construct the full URL (assuming the base URL is https://example.com/chess)
const winningBoardUrl = ` http://localhost:5173/chess-game?game=${encodedState}`;

console.log(winningBoardUrl);