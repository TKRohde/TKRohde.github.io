import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { collection, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig';

const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchGames = async (startAfterDoc = null) => {
    setLoading(true);
    try {
      let gamesQuery = query(
        collection(db, 'games'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      if (startAfterDoc) {
        gamesQuery = query(gamesQuery, startAfter(startAfterDoc));
      }

      const querySnapshot = await getDocs(gamesQuery);
      const newGames = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setGames(prevGames => startAfterDoc ? [...prevGames, ...newGames] : newGames);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === 10);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const loadMore = () => {
    if (lastVisible) {
      fetchGames(lastVisible);
    }
  };

  const getGameStats = (game) => {
    const moves = game.moves || {};
    const moveIds = Object.keys(moves);
    
    const parentMoves = new Set(
      Object.values(moves)
        .map(move => move.parentMoveId)
        .filter(id => id !== null)
    );
    
    const leafMoves = moveIds.filter(id => !parentMoves.has(id));
    
    let totalParallel = leafMoves.length;
    let ongoing = 0;
    let blackWins = 0;
    let whiteWins = 0;

    leafMoves.forEach(id => {
      const move = moves[id];
      if (move.isEndGame) {
        if (move.winner === 'black') blackWins++;
        if (move.winner === 'white') whiteWins++;
      } else {
        ongoing++;
      }
    });

    return { totalParallel, ongoing, blackWins, whiteWins };
  };

  const getFormattedDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Chess Games
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="chess games table">
          <TableHead>
            <TableRow>
              <TableCell>Game ID</TableCell>
              <TableCell align="right">Total Parallel</TableCell>
              <TableCell align="right">Ongoing</TableCell>
              <TableCell align="right">Black Wins</TableCell>
              <TableCell align="right">White Wins</TableCell>
              <TableCell align="right">Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games.map((game) => {
              const stats = getGameStats(game);
              return (
                <TableRow
                  key={game.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  hover
                  component={Link}
                  to={`/game/${game.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <TableCell component="th" scope="row">
                    {game.id}
                  </TableCell>
                  <TableCell align="right">{stats.totalParallel}</TableCell>
                  <TableCell align="right">{stats.ongoing}</TableCell>
                  <TableCell align="right">{stats.blackWins}</TableCell>
                  <TableCell align="right">{stats.whiteWins}</TableCell>
                  <TableCell align="right">{getFormattedDate(game.createdAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {loading && <CircularProgress sx={{ display: 'block', margin: 'auto', marginTop: 2 }} />}
      {hasMore && !loading && (
        <Button 
          onClick={loadMore} 
          fullWidth 
          variant="contained" 
          sx={{ marginTop: 2 }}
        >
          Load More
        </Button>
      )}
    </Box>
  );
};

export default Games;