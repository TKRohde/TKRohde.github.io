import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Box, Button, IconButton, Typography } from '@mui/material';
import Link from '@mui/material/Link';
import React from 'react';
import ChessBoard from './ChessBoard';
import GameStatus from './GameStatus';

const ChessGameContent = ({ 
  theme, 
  colorMode, 
  chess, 
  gameStatus, 
  handleMove, 
  boardDisabled, 
  copyUrlToClipboard, 
  startNewGame 
}) => (
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

export default ChessGameContent;