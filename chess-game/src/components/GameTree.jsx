import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import { TreeItem, TreeView } from '@mui/x-tree-view';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';

const GameTree = () => {
  const { gameId } = useParams();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameData = async () => {
      if (!gameId) {
        setError('No game ID provided');
        setLoading(false);
        return;
      }

      try {
        const gameDoc = await getDoc(doc(db, 'games', gameId));
        if (gameDoc.exists()) {
          const data = gameDoc.data();
          console.log('Fetched game data:', data);
          setGameData(data);
        } else {
          setError('Game not found');
        }
      } catch (err) {
        setError('Error fetching game data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId]);

  const getMoveName = (move) => {
    if (!move) return 'Initial position';
    if (typeof move === 'string') return move;
    if (move.from && move.to) return `${move.from}-${move.to}`;
    return JSON.stringify(move);
  };

  const buildMoveTree = (moves) => {
    const moveTree = {};
    let rootNode = null;

    // First pass: create nodes for all moves
    Object.entries(moves).forEach(([moveId, move]) => {
      moveTree[moveId] = { ...move, id: moveId, children: [] };
      if (move.parentMoveId === null) {
        rootNode = moveTree[moveId];
      }
    });

    // Second pass: build the tree structure
    Object.values(moveTree).forEach(node => {
      if (node.parentMoveId && moveTree[node.parentMoveId]) {
        moveTree[node.parentMoveId].children.push(node);
      }
    });

    // Sort children by timestamp if available
    const sortChildren = (node) => {
      node.children.sort((a, b) => (a.timestamp && b.timestamp) ? a.timestamp - b.timestamp : 0);
      node.children.forEach(sortChildren);
    };
    sortChildren(rootNode);

    return rootNode;
  };

  const renderMoveTree = (node, depth = 0) => {
    if (!node) return null;

    let label;
    if (depth === 0) {
      label = "Starting Position";
    } else {
      const moveNumber = Math.floor((depth + 1) / 2);
      const isWhiteMove = depth % 2 !== 0;
      const moveName = getMoveName(node.move);
      const moveNotation = isWhiteMove 
        ? `${moveNumber}. ${moveName}` 
        : `${moveNumber}... ${moveName}`;
      label = `${moveNotation} (${node.nickname || 'Anonymous'})`;
    }

    return (
      <TreeItem
        key={node.id}
        nodeId={node.id}
        label={
          <Box>
            <Typography>{label}</Typography>
            {node.winner && (
              <Typography variant="caption" color="error">
                Game Over - {node.winner === 'white' ? 'White' : 'Black'} wins
              </Typography>
            )}
          </Box>
        }
      >
        {node.children.map((child, index) => renderMoveTree(child, depth + 1))}
      </TreeItem>
    );
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  const moveTree = gameData ? buildMoveTree(gameData.moves) : null;

  return (
    <Box sx={{ width: '100%', maxWidth: 800, margin: 'auto' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>Game Tree for ID: {gameId}</Typography>
        <Typography variant="body1">
          This tree shows all possible game variations starting from the initial position.
          Each node represents a move, and you can expand nodes to see subsequent moves.
        </Typography>
      </Paper>
      {moveTree ? (
        <Paper elevation={3} sx={{ p: 3 }}>
          <TreeView
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            defaultExpanded={[moveTree.id]}
          >
            {renderMoveTree(moveTree)}
          </TreeView>
        </Paper>
      ) : (
        <Typography>No valid move data available.</Typography>
      )}
    </Box>
  );
};

export default GameTree;