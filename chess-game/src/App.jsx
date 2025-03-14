import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  CssBaseline,
  GlobalStyles,
  IconButton,
  Snackbar,
  Toolbar,
  Typography,
  useMediaQuery
} from '@mui/material';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { Chess } from 'chess.js';
import { collection, doc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import About from './components/About';
import ChessGameContent from './components/ChessGameContent';
import DrawerMenu from './components/DrawerMenu';
import GameTree from './components/GameTree';
import Games from './components/Games';
import ShareGameDialog from './components/ShareGameDialog';
import Stats from './components/Stats';
import { db } from './firebaseConfig';
import { decodeGameState } from './utils/urlDecoder';
import { encodeGameState, generateId } from './utils/urlEncoder';

const ColorModeContext = React.createContext({ toggleColorMode: () => { } });

function App() {
  const [chess, setChess] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [moveId, setMoveId] = useState(null);
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
  const [pendingMove, setPendingMove] = useState(null);
  const [isNewGame, setIsNewGame] = useState(false);
  const initializationRef = useRef(false);

  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const colorMode = React.useContext(ColorModeContext);
  
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (initializationRef.current) return; // Skip if already initialized
    initializationRef.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const encodedState = urlParams.get('game');

    if (encodedState) {
      try {
        const { gameId, moveId, fen } = decodeGameState(encodedState);
        const newChess = new Chess(fen);
        setChess(newChess);
        setGameId(gameId);
        setMoveId(moveId);
        updateGameStatus(newChess);
        setBoardDisabled(newChess.isGameOver());
      } catch (error) {
        console.error('Error decoding game state:', error);
        initializeNewGame(false);
      }
    } else {
      initializeNewGame(false);
    }
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

  const initializeNewGame = async (promptForNickname = false) => {
    const newChess = new Chess();
    const newGameId = generateId();
    const newMoveId = generateId();

    setChess(newChess);
    setGameId(newGameId);
    setMoveId(newMoveId);
    updateGameStatus(newChess);
    setBoardDisabled(false);

    try {
      await setDoc(doc(db, 'games', newGameId), {
        startPosition: newChess.fen(),
        createdAt: serverTimestamp(),
        moves: {
          [newMoveId]: {
            fen: newChess.fen(),
            move: null,
            timestamp: serverTimestamp(),
            parentMoveId: null
          }
        }
      });

      const newEncodedState = encodeGameState(newGameId, newMoveId, newChess.fen());
      const newUrl = `${window.location.origin}${window.location.pathname}?game=${newEncodedState}`;
      window.history.pushState({}, '', newUrl);
      setGameUrl(newUrl);

      if (promptForNickname) {
        setIsNewGame(true);
        setOpenDialog(true);
      }
    } catch (error) {
      console.error('Error initializing new game:', error);
      setSnackbarMessage('Failed to create a new game. Please try again.');
      setShowSnackbar(true);
    }
  };

  const startNewGame = () => {
    initializeNewGame(true);
  };

  const handleMove = (move) => {
    const newChess = new Chess(chess.fen());
    const result = newChess.move(move);
    if (result) {
      const newMoveId = generateId();
      const newEncodedState = encodeGameState(gameId, newMoveId, newChess.fen());
      const newUrl = `${window.location.origin}${window.location.pathname}?game=${newEncodedState}`;
      
      setGameUrl(newUrl);  // Update the gameUrl state
      setPendingMove({ chess: newChess, move, newMoveId });
      setIsNewGame(false);
      setOpenDialog(true);
    }
  };

  const handleDialogClose = async () => {
    if (pendingMove) {
      const { chess: newChess, move, newMoveId } = pendingMove;
  
      setChess(newChess);
      setMoveId(newMoveId);
      updateGameStatus(newChess);
      setBoardDisabled(newChess.isGameOver());
  
      // Update Firebase
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        [`moves.${newMoveId}`]: {
          fen: newChess.fen(),
          move: move,
          timestamp: serverTimestamp(),
          parentMoveId: moveId,
          nickname: nickname || 'Anonymous'
        }
      });
  
      // The URL has already been updated in handleMove, so we don't need to update it here
      window.history.pushState({}, '', gameUrl);
  
      if (newChess.isGameOver()) {
        handleGameOver(newChess, gameId, newMoveId);
      }
  
      setPendingMove(null);
    }
  
    setOpenDialog(false);
    setNickname('');
  
    // Attempt to copy the updated URL
    try {
      await navigator.clipboard.writeText(gameUrl);
      setSnackbarMessage('Game URL copied to clipboard!');
    } catch (err) {
      console.error('Could not copy URL automatically: ', err);
      setSnackbarMessage('Use the "Copy Game URL" button to copy the link.');
    }
    setShowSnackbar(true);
  };

  const handleTweet = () => {
    const turnColor = chess.turn() === 'w' ? 'White' : 'Black';
    const shortenedUrl = gameUrl.replace(/^https?:\/\//, ''); // Remove http:// or https://
    const tweetText = encodeURIComponent(`🎉 Chess challenge! It's ${turnColor}'s turn. Your move! 🤔♟️ Play: ${shortenedUrl} (I'm ${nickname || 'Anonymous'}) #ChessAnywhere #URLChess`);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
    handleDialogClose();
  };

  const handleGameOver = async (chess, gameId, moveId) => {
    await updateDoc(doc(db, 'games', gameId), {
      [`moves.${moveId}.isEndGame`]: true,
      [`moves.${moveId}.winner`]: chess.turn() === 'w' ? 'black' : 'white'
    });

    setSnackbarMessage('Game over! The result has been recorded.');
    setShowSnackbar(true);
  };

const copyUrlToClipboard = () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    setSnackbarMessage('Game URL successfully copied to clipboard!');
    setShowSnackbar(true);
  }, (err) => {
    console.error('Could not copy URL: ', err);
    setSnackbarMessage('Failed to copy URL. Please try again or copy manually from the address bar.');
    setShowSnackbar(true);
  });
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

  const globalStyles = (
    <GlobalStyles
      styles={{
        '& .MuiButtonBase-root:focus': {
          outline: 'none',
        },
      }}
    />
  );

  return (
    <Router>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden'
      }}>
        <CssBaseline />
        {globalStyles}
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
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          position: 'relative',
          pt: `${theme.mixins.toolbar.minHeight}px`
        }}>
          <DrawerMenu 
            open={drawerOpen} 
            handleDrawerClose={handleDrawerClose}
            drawerWidth={isMobile ? '100%' : 240}
            toggleColorMode={colorMode.toggleColorMode}
          />
          <Box component="main" sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
            overflow: 'auto',
            p: 2,
          }}>
            <Routes>
              <Route path="/" element={
                <ChessGameContent
                  theme={theme}
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
              <Route path="/game/:gameId" element={<GameTree />} />
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
      <ShareGameDialog
        open={openDialog}
        onClose={handleDialogClose}
        nickname={nickname}
        onNicknameChange={setNickname}
        onTweet={handleTweet}
        isNewGame={isNewGame}
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