import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Box, Button, Container, IconButton, Link, Snackbar, Typography } from '@mui/material';
import { Chess } from 'chess.js';
import React, { useEffect, useState } from 'react';
import ChessBoard from './components/ChessBoard';
import GameStatus from './components/GameStatus';
import { decodeGameState } from './utils/urlDecoder';
import { encodeGameState } from './utils/urlEncoder';

const App = () => {
  const [chess, setChess] = useState(null);
  const [gameStatus, setGameStatus] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedState = urlParams.get('game');
    
    let newChess;
    if (encodedState) {
      try {
        const { chess: decodedChess } = decodeGameState(encodedState);
        newChess = decodedChess;
      } catch (error) {
        console.error('Error decoding game state:', error);
        newChess = new Chess(); 
      }
    } else {
      newChess = new Chess();
    }
    setChess(newChess);
    updateGameStatus(newChess);
  }, []);

  const updateGameStatus = (chessInstance) => {
    if (chessInstance.isCheckmate()) {
      setGameStatus(`Checkmate! ${chessInstance.turn() === 'w' ? 'Black' : 'White'} wins!`);
    } else if (chessInstance.isDraw()) {
      setGameStatus('Draw!');
    } else if (chessInstance.isStalemate()) {
      setGameStatus('Stalemate!');
    } else if (chessInstance.isThreefoldRepetition()) {
      setGameStatus('Draw by threefold repetition!');
    } else if (chessInstance.isInsufficientMaterial()) {
      setGameStatus('Draw by insufficient material!');
    } else {
      setGameStatus(`Current turn: ${chessInstance.turn() === 'w' ? 'White' : 'Black'}`);
    }
  };

  const handleMove = (move) => {
    const newChess = new Chess(chess.fen());
    const result = newChess.move(move);
    if (result) {
      setChess(newChess);
      updateGameStatus(newChess);
      const newEncodedState = encodeGameState(newChess);
      const newUrl = `${window.location.origin}${window.location.pathname}?game=${newEncodedState}`;
      window.history.pushState({}, '', newUrl);
      
      navigator.clipboard.writeText(newUrl).then(() => {
        setSnackbarMessage('Move made! URL copied to clipboard. Share it with your opponent.');
        setShowSnackbar(true);
      }, (err) => {
        console.error('Could not copy URL: ', err);
        setSnackbarMessage('Move made! Please copy the URL to share with your opponent.');
        setShowSnackbar(true);
      });
    }
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setSnackbarMessage('URL copied to clipboard!');
      setShowSnackbar(true);
    }, (err) => {
      console.error('Could not copy URL: ', err);
      setSnackbarMessage('Failed to copy URL. Please copy it manually.');
      setShowSnackbar(true);
    });
  };

  const startNewGame = () => {
    const newChess = new Chess();
    setChess(newChess);
    updateGameStatus(newChess);
    const newEncodedState = encodeGameState(newChess);
    const newUrl = `${window.location.origin}${window.location.pathname}?game=${newEncodedState}`;
    window.history.pushState({}, '', newUrl);
    setSnackbarMessage('New game started! URL updated.');
    setShowSnackbar(true);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Chess Anywhere: The URL-Encoded Chess Game
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Make your move on the board below. After each move, a new URL will be generated and copied to your clipboard. Share this URL with your opponent, or tweet it, to continue the game!
        </Typography>

        {chess && (
          <>
            <GameStatus status={gameStatus} />

            <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
              <ChessBoard fen={chess.fen()} onMove={handleMove} disabled={chess.isGameOver()} />
            </Box>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<ContentCopyIcon />}
                onClick={copyUrlToClipboard}
              >
                Copy Game URL
              </Button>
              <Button
                variant="outlined"
                onClick={startNewGame}
              >
                Start New Game
              </Button>
            </Box>
          </>
        )}

        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={() => setShowSnackbar(false)}
          message={snackbarMessage}
        />
      </Box>
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2">
          Created by Thomas Klok Rohde - <Link href="mailto:thomas@rohde.name">thomas@rohde.name</Link>
        </Typography>
        <IconButton 
          aria-label="github repository"
          onClick={() => window.open('https://github.com/TKRohde/TKRohde.github.io', '_blank')}
        >
          <GitHubIcon />
        </IconButton>
      </Box>
    </Container>
  );
};

export default App;