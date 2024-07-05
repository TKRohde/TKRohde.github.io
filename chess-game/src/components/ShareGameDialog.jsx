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

const ShareGameDialog = ({ open, onClose, nickname, onNicknameChange, onTweet }) => {
  return (
    <Dialog open={open} onClose={onClose}>
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