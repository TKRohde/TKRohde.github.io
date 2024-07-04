import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Box, Button, Container, Paper, Snackbar, Typography } from '@mui/material';
import { Chess } from 'chess.js';
import React, { useEffect, useState } from 'react';
import ChessBoard from './components/ChessBoard';
import { decodeGameState } from './utils/urlDecoder';
import { encodeGameState } from './utils/urlEncoder';

const App = () => {
  const [chess, setChess] = useState(null);
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
        newChess = new Chess(); // Fallback to a new game
      }
    } else {
      newChess = new Chess();
    }
    setChess(newChess);
  }, []);

  const handleMove = (move) => {
    const newChess = new Chess(chess.fen());
    const result = newChess.move(move);
    if (result) {
      setChess(newChess);
      const newEncodedState = encodeGameState(newChess);
      const newUrl = `${window.location.origin}${window.location.pathname}?game=${newEncodedState}`;
      window.history.pushState({}, '', newUrl);
      
      // Copy URL to clipboard
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

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Chess Anywhere: The URL-Encoded Chess Game
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Make your move on the board below. After each move, a new URL will be generated and copied to your clipboard. Share this URL with your opponent to continue the game!
        </Typography>

        {chess && (
          <>
            <Paper 
              elevation={3} 
              sx={{ 
                my: 2, 
                py: 1, 
                px: 2, 
                display: 'inline-block', 
                backgroundColor: chess.turn() === 'w' ? '#f5f5f5' : '#424242',
                color: chess.turn() === 'w' ? 'black' : 'white'
              }}
            >
              <Typography variant="h6">
                Current Turn: {chess.turn() === 'w' ? 'White' : 'Black'}
              </Typography>
            </Paper>

            <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
              <ChessBoard fen={chess.fen()} onMove={handleMove} />
            </Box>
          </>
        )}

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={copyUrlToClipboard}
          >
            Copy Game URL
          </Button>
        </Box>

        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={() => setShowSnackbar(false)}
          message={snackbarMessage}
        />
      </Box>
    </Container>
  );
};

export default App;