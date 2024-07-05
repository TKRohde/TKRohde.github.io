import BarChartIcon from '@mui/icons-material/BarChart';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GamesIcon from '@mui/icons-material/Games';
import GitHubIcon from '@mui/icons-material/GitHub';
import InfoIcon from '@mui/icons-material/Info';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Toolbar,
  Typography
} from '@mui/material';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { Chess } from 'chess.js';
import { collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Link as RouterLink, Routes } from 'react-router-dom';
import About from './components/About';
import ChessBoard from './components/ChessBoard';
import GameStatus from './components/GameStatus';
import Games from './components/Games';
import Stats from './components/Stats';
import { db } from './firebaseConfig';
import { decodeGameState } from './utils/urlDecoder';
import { encodeGameState } from './utils/urlEncoder';

const ColorModeContext = React.createContext({ toggleColorMode: () => { } });
const drawerWidth = 240;

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

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

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const ChessGameContent = () => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
      width: '100%',
      maxWidth: 'md',
      mx: 'auto',
      px: 2,
      boxSizing: 'border-box',
    }}>
      <Typography variant="h2" component="h1" gutterBottom sx={{ 
        fontSize: { xs: '2rem', sm: '3rem' },
        textAlign: 'center'
      }}>
        Chess Anywhere: The URL-Encoded Chess Game
      </Typography>

      <Typography variant="body1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
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
          mb: 3
        }}
      >
        {theme.palette.mode} mode
        <IconButton
          sx={{ ml: 1 }}
          onClick={colorMode.toggleColorMode}
          color="inherit"
        >
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>

      {chess && (
        <>
          <GameStatus status={gameStatus} />

          <Box sx={{ my: 4, display: 'flex', justifyContent: 'center', width: '100%' }}>
            <ChessBoard
              fen={chess.fen()}
              onMove={handleMove}
              disabled={boardDisabled}
              darkMode={theme.palette.mode === 'dark'}
            />
          </Box>

          <Box sx={{ 
            mt: 2, 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            justifyContent: 'center', 
            gap: 2,
            width: '100%',
            maxWidth: '400px'
          }}>
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
    </Box>
  );

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(drawerOpen && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Chess Anywhere
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="persistent"
          anchor="left"
          open={drawerOpen}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>
          <List>
            {[
              { text: 'Home', icon: <GamesIcon />, path: '/' },
              { text: 'Games', icon: <GamesIcon />, path: '/games' },
              { text: 'Stats', icon: <BarChartIcon />, path: '/stats' },
              { text: 'About', icon: <InfoIcon />, path: '/about' }
            ].map((item) => (
              <ListItem button key={item.text} component={RouterLink} to={item.path} onClick={handleDrawerClose}>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: '100%',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: 0,
        }}>
          <Toolbar />
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}>
            <Routes>
              <Route path="/" element={<ChessGameContent />} />
              <Route path="/games" element={<Games />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Box>
        </Box>
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
      />
    </Router>
  );
}

function ToggleColorMode() {
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

export default ToggleColorMode;