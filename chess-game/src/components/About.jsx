import CodeIcon from '@mui/icons-material/Code';
import RuleIcon from '@mui/icons-material/Gavel';
import HistoryIcon from '@mui/icons-material/History';
import LinkIcon from '@mui/icons-material/Link';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import { Box, List, ListItem, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const About = () => {
  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: 3 }}>
      <Typography variant="h3" gutterBottom>
        About Chess Anywhere
      </Typography>
      
      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h5" gutterBottom>
          What is Chess Anywhere?
        </Typography>
        <Typography paragraph>
          Chess Anywhere is a unique and innovative approach to playing chess online. 
          It's not just another chess app – it's a whole new way to think about online gaming.
          Our platform allows you to play chess with anyone, anywhere, without the need for 
          accounts or logins. How? By encoding the entire game state in the URL itself!
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h5" gutterBottom>
          Key Features
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <LinkIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="URL-Encoded Games" 
              secondary="The entire game state, including piece positions and whose turn it is, is encoded in the URL."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PeopleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Play with Anyone" 
              secondary="Share your game URL on social media, via email, or any messaging platform. Anyone with the link can make the next move."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SecurityIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="No Account Needed" 
              secondary="Play anonymously without the need to create an account or log in."
            />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h5" gutterBottom>
          How to Play
        </Typography>
        <Typography paragraph>
          1. Start a new game or open a shared URL.
        </Typography>
        <Typography paragraph>
          2. Make your move on the chess board.
        </Typography>
        <Typography paragraph>
          3. After your move, a new URL will be generated. Copy this URL and share it with your opponent.
        </Typography>
        <Typography paragraph>
          4. Your opponent opens the URL, sees the updated board, and makes their move.
        </Typography>
        <Typography paragraph>
          5. Repeat until the game is over!
        </Typography>
        <Typography>
          Ready to play? <RouterLink to="/">Start a new game now!</RouterLink>
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h5" gutterBottom>
          The Story Behind Chess Anywhere
        </Typography>
        <Typography paragraph>
          Chess Anywhere has its roots in an old idea that had been brewing for years. The concept of a URL-encoded 
          chess game had long been a fascinating thought experiment, but it needed the right technology and approach 
          to become a reality.
        </Typography>
        <Typography paragraph>
          In the summer of 2024, during a break, the project finally took shape. The game's creator, despite not 
          having played much chess in recent years, had held onto this innovative idea. To bring it to life, they 
          turned to Claude 3.5 Sonnet, an advanced AI language model.
        </Typography>
        <Typography paragraph>
          Over the course of just a few days, Chess Anywhere was developed almost entirely through collaboration 
          with Claude. This unique development process allowed for rapid iteration and problem-solving, turning a 
          long-held idea into a functional, innovative chess platform.
        </Typography>
        <Typography paragraph>
          The result is a testament to the power of persistent ideas and the potential of AI-assisted development 
          in bringing novel concepts to life.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" gutterBottom>
          Rules and Fair Play
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <RuleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Standard Chess Rules Apply" 
              secondary="Chess Anywhere follows all standard rules of chess, including special moves like castling and en passant."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SecurityIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Move Validation" 
              secondary="Our system validates all moves to ensure they are legal according to chess rules."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <HistoryIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Game History" 
              secondary="While the URL only contains the current state, we're working on a feature to view the full game history."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CodeIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="AI-Assisted Development" 
              secondary="Chess Anywhere was developed with the assistance of Claude 3.5 Sonnet, showcasing the potential of AI in game development."
            />
          </ListItem>
        </List>
        <Typography paragraph sx={{ marginTop: 2 }}>
          We rely on the honor system and the spirit of fair play. Please respect your opponents and the game. 
          Enjoy the unique experience of Chess Anywhere, and may the best strategist win!
        </Typography>
      </Paper>
    </Box>
  );
};

export default About;