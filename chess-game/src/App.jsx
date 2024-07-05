import BarChartIcon from '@mui/icons-material/BarChart';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import GamesIcon from '@mui/icons-material/Games';
import InfoIcon from '@mui/icons-material/Info';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { Chess } from 'chess.js';
import { collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Link as RouterLink, Routes } from 'react-router-dom';
import About from './components/About';
import ChessGameContent from './components/ChessGameContent';
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
  const [openDialog, setOpenDialog] = useState(false);
  const [nickname, setNickname] = useState('');
  const [gameUrl, setGameUrl] = useState('');

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
      setBoardDisabled(true);
      setGameUrl(newUrl);
      setOpenDialog(true);
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
    setGameUrl(newUrl);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNickname('');
    navigator.clipboard.writeText(gameUrl).then(() => {
      setSnackbarMessage('Game URL copied to clipboard!');
      setShowSnackbar(true);
    }, (err) => {
      console.error('Could not copy URL: ', err);
      setSnackbarMessage('Failed to copy URL. Please copy it manually.');
      setShowSnackbar(true);
    });
  };

  const handleTweet = () => {
    const tweetText = encodeURIComponent(`I'm playing Chess Anywhere! Join my game: ${gameUrl} (My nickname: ${nickname})`);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
    handleDialogClose();
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
              <Route path="/" element={
                <ChessGameContent
                  theme={theme}
                  colorMode={colorMode}
                  chess={chess}
                  gameStatus={gameStatus}
                  handleMove={handleMove}
                  boardDisabled={boardDisabled}
                  copyUrlToClipboard={copyUrlToClipboard}
                  startNewGame={startNewGame}
                />
              } />
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
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Share Your Game</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your nickname and choose how you'd like to share your game.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="nickname"
            label="Nickname (e.g., Twitter handle)"
            type="text"
            fullWidth
            variant="standard"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>OK (Copy URL)</Button>
          <Button onClick={handleTweet} >
            Tweet
          </Button>
        </DialogActions>
      </Dialog>
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