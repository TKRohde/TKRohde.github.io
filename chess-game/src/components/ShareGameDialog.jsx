import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from '@mui/material';
import React from 'react';

const ShareGameDialog = ({ open, onClose, nickname, onNicknameChange, onTweet, isNewGame }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isNewGame ? 'New Game Started' : 'Share Your Move'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {isNewGame
            ? "🎉 You've started a new chess adventure! Ready to invite a challenger? "
            : "♟️ Great move! Time to challenge someone to respond! "}
          On mobile devices, you may need to use the "Copy Game URL" button on the main screen to copy the link.
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
          onChange={(e) => onNicknameChange(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>OK (Copy URL)</Button>
        <Button onClick={onTweet}>
          Tweet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareGameDialog;