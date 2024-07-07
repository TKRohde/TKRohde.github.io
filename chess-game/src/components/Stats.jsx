import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import { db } from '../firebaseConfig';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Stats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGames: 0,
    gameOutcomes: { whiteWins: 0, blackWins: 0, draws: 0, ongoing: 0 },
    averageParallelGames: 0,
    movesPerGame: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const gamesSnapshot = await getDocs(collection(db, 'games'));
        let totalGames = 0;
        let totalParallelGames = 0;
        const gameOutcomes = { whiteWins: 0, blackWins: 0, draws: 0, ongoing: 0 };
        const movesPerGame = [];

        gamesSnapshot.forEach((doc) => {
          const game = doc.data();
          totalGames++;

          // Count moves and parallel games
          const moves = Object.values(game.moves || {});
          movesPerGame.push(moves.length);

          // Count leaf nodes (parallel games)
          const leafNodes = moves.filter(move => !moves.some(m => m.parentMoveId === move.id));
          totalParallelGames += leafNodes.length;

          // Count outcomes
          leafNodes.forEach(node => {
            if (node.isEndGame) {
              if (node.winner === 'white') gameOutcomes.whiteWins++;
              else if (node.winner === 'black') gameOutcomes.blackWins++;
              else if (node.winner === 'draw') gameOutcomes.draws++;
            } else {
              gameOutcomes.ongoing++;
            }
          });
        });

        setStats({
          totalGames,
          gameOutcomes,
          averageParallelGames: totalParallelGames / totalGames,
          movesPerGame,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  const outcomeData = [
    { name: 'White Wins', value: stats.gameOutcomes.whiteWins },
    { name: 'Black Wins', value: stats.gameOutcomes.blackWins },
    { name: 'Draws', value: stats.gameOutcomes.draws },
    { name: 'Ongoing', value: stats.gameOutcomes.ongoing },
  ];

  const movesPerGameData = stats.movesPerGame.reduce((acc, moves) => {
    const bucket = Math.floor(moves / 10) * 10;
    const label = `${bucket}-${bucket + 9}`;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const movesPerGameChartData = Object.entries(movesPerGameData).map(([label, count]) => ({
    label,
    count,
  }));

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>Chess Anywhere Statistics</Typography>
      
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Game Outcomes</Typography>
        <PieChart width={400} height={300}>
          <Pie
            data={outcomeData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {outcomeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </Paper>

      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Moves per Game</Typography>
        <BarChart width={400} height={300} data={movesPerGameChartData}>
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </Paper>

      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>General Statistics</Typography>
        <Typography>Total Games: {stats.totalGames}</Typography>
        <Typography>Average Parallel Games: {stats.averageParallelGames.toFixed(2)}</Typography>
      </Paper>
    </Box>
  );
};

export default Stats;