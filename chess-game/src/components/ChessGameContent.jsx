import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Box, Button, IconButton, Typography, useMediaQuery } from '@mui/material';
import Link from '@mui/material/Link';
import React from 'react';
import ChessBoard from './ChessBoard';
import GameStatus from './GameStatus';

const ChessGameContent = ({
  theme,
  chess,
  gameStatus,
  handleMove,
  boardDisabled,
  copyUrlToClipboard,
  startNewGame
}) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
      width: '100%',
      maxWidth: 'md',
      mx: 'auto',
      pt: { xs: 3, sm: 4 },
      boxSizing: 'border-box',
    }}>
      <Typography variant="body1" gutterBottom sx={{
        textAlign: 'center',
        mb: { xs: 1, sm: 2 },
        fontSize: { xs: '0.875rem', sm: '1rem' }
      }}>
        Make your move on the board below. After each move, a new URL will be generated and copied to your clipboard. Share this URL with your opponent, or tweet it, to continue the game!
      </Typography>

      {chess && (
        <>
          <GameStatus status={gameStatus} />

          <Box sx={{ my: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center', width: '100%' }}>
            <ChessBoard
              fen={chess.fen()}
              onMove={handleMove}
              disabled={boardDisabled}
              darkMode={theme.palette.mode === 'dark'}
              isMobile={isMobile}
            />
          </Box>

          <Box sx={{
            mt: { xs: 1, sm: 2 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            gap: { xs: 1, sm: 2 },
            width: '100%',
            maxWidth: { xs: '100%', sm: '400px' }
          }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ContentCopyIcon />}
              onClick={copyUrlToClipboard}
              fullWidth
              size={isMobile ? 'small' : 'medium'}
            >
              Copy Game URL
            </Button>
            <Button
              variant="outlined"
              onClick={startNewGame}
              fullWidth
              size={isMobile ? 'small' : 'medium'}
            >
              Start New Game
            </Button>
          </Box>
        </>
      )}

      <Box sx={{ mt: { xs: 2, sm: 3 }, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          Created by Thomas Klok Rohde - <Link href="mailto:thomas@rohde.name">thomas@rohde.name</Link>
        </Typography>
        <IconButton
          aria-label="github repository"
          onClick={() => window.open('https://github.com/TKRohde/TKRohde.github.io', '_blank')}
          size={isMobile ? 'small' : 'medium'}
        >
          <GitHubIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChessGameContent;