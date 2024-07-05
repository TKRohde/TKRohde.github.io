import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GitHubIcon from '@mui/icons-material/GitHub';
import {
  Box,
  Button,
  Container,
  CssBaseline,
  IconButton,
  Link,
  Snackbar,
  Typography
} from '@mui/material';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { Chess } from 'chess.js';

import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import ChessBoard from './components/ChessBoard';
import GameStatus from './components/GameStatus';
import { db } from './firebaseConfig';
import { decodeGameState } from './utils/urlDecoder';
import { encodeGameState } from './utils/urlEncoder';

const ColorModeContext = React.createContext({ toggleColorMode: () => { } });

function App() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const [chess, setChess] = useState(null);
  const [gameStatus, setGameStatus] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [boardDisabled, setBoardDisabled] = useState(false);

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
    setBoardDisabled(newChess.isGameOver());
  }, []);

  const updateGameStatus = (chessInstance) => {
    if (chessInstance.isCheckmate()) {
      setGameStatus(`Checkmate! ${chessInstance.turn() === 'w' ? 'Black' : 'White'} wins!`);
      setBoardDisabled(true);
    } else if (chessInstance.isDraw()) {
      setGameStatus('Draw!');
      setBoardDisabled(true);
    } else if (chessInstance.isStalemate()) {
      setGameStatus('Stalemate!');
      setBoardDisabled(true);
    } else if (chessInstance.isThreefoldRepetition()) {
      setGameStatus('Draw by threefold repetition!');
      setBoardDisabled(true);
    } else if (chessInstance.isInsufficientMaterial()) {
      setGameStatus('Draw by insufficient material!');
      setBoardDisabled(true);
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
      setBoardDisabled(true);  // Disable the board after a move

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

  useEffect(() => {
    const testFirebase = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'games'));
        console.log('Successfully connected to Firestore. Number of documents:', querySnapshot.size);
        setIsConnected(true);
      } catch (error) {
        console.error('Error connecting to Firestore:', error);
        setError(error.message);
      }
    };

    testFirebase();
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}>
          Chess Anywhere: The URL-Encoded Chess Game
        </Typography>

        <Typography variant="body1" gutterBottom>
          Make your move on the board below. After each move, a new URL will be generated and copied to your clipboard. Share this URL with your opponent, or tweet it, to continue the game!
        </Typography>

        <Box
          sx={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            color: 'text.primary',
            borderRadius: 1,
            p: 3,
          }}
        >
          {theme.palette.mode} mode
          <IconButton
            sx={{
              ml: 1,
              userSelect: 'none',
              '&:focus': {
                outline: 'none',
              },
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
            disableRipple
            onClick={colorMode.toggleColorMode}
            color="inherit"
          >
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>

        {chess && (
          <>
            <GameStatus status={gameStatus} />

            <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
              <ChessBoard
                fen={chess.fen()}
                onMove={handleMove}
                disabled={boardDisabled}
                darkMode={theme.palette.mode === 'dark'}
              />
            </Box>

            <Box sx={{ mt: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<ContentCopyIcon />}
                onClick={copyUrlToClipboard}
                fullWidth
              >
                Copy Game URL
              </Button>
              <Button
                variant="outlined"
                onClick={startNewGame}
                fullWidth
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
}

export default function ToggleColorMode() {
  const [mode, setMode] = React.useState('dark');
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}