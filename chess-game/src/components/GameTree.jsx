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

  const generateBranchName = (moveCount) => {
    const descriptors = [
      "Bold", "Cautious", "Aggressive", "Defensive", "Surprising",
      "Classical", "Modern", "Unorthodox", "Positional", "Tactical",
      "Kingside", "Queenside", "Central", "Flank", "Counterattack"
    ];
    const pieces = ["Pawn", "Knight", "Bishop", "Rook", "Queen", "King"];
    const actions = ["Advance", "Sacrifice", "Exchange", "Maneuver", "Development"];

    const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];

    return `${descriptor} ${piece} ${action} (Move ${moveCount})`;
  };

  const buildGameTree = (moves) => {
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

  const renderGameTree = (node, moveCount = 0, isFirstBranch = true) => {
    if (!node) return null;

    const renderMoveSequence = (currentNode) => {
      let moves = [];
      let current = currentNode;
      let currentMoveCount = moveCount;

      while (current && current.children.length <= 1) {
        if (current.move) {  // Skip the initial position
          currentMoveCount++;
          const moveName = getMoveName(current.move);
          const moveNumber = Math.ceil(currentMoveCount / 2);
          const isWhiteMove = currentMoveCount % 2 !== 0;
          moves.push(`${moveNumber}${isWhiteMove ? '.' : '...'} ${moveName} (${current.nickname || 'Anonymous'})`);
        }
        if (current.children.length === 0) break;
        current = current.children[0];
      }

      return {
        moveSequence: (
          <Box>
            <Typography variant="body2">{moves.join(', ')}</Typography>
            {current && current.children.length > 0 && (
              <TreeView
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
              >
                {current.children.map((child, index) => renderGameTree(child, currentMoveCount, false))}
              </TreeView>
            )}
            {current && current.isEndGame && (
              <Typography variant="caption" color="error">
                Game Over - {current.winner === 'white' ? 'White' : current.winner === 'black' ? 'Black' : 'Draw'}
              </Typography>
            )}
          </Box>
        ),
        finalMoveCount: currentMoveCount
      };
    };

    const { moveSequence, finalMoveCount } = renderMoveSequence(node);
    const branchName = isFirstBranch ? "Main Line" : generateBranchName(Math.ceil(finalMoveCount / 2));

    return (
      <TreeItem
        key={node.id}
        nodeId={node.id}
        label={
          <Box>
            <Typography variant="subtitle1">
              {branchName}
            </Typography>
            {moveSequence}
          </Box>
        }
      />
    );
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  const gameTree = gameData ? buildGameTree(gameData.moves) : null;

  return (
    <Box sx={{ width: '100%', maxWidth: 800, margin: 'auto', height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>Game Tree for ID: {gameId}</Typography>
        <Typography variant="body1">
          This tree shows the game progression. Each node represents a sequence of moves until a branching point or the end of a game.
        </Typography>
      </Paper>
      {gameTree ? (
        <Paper elevation={3} sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
          <TreeView
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            defaultExpanded={[gameTree.id]}
          >
            {renderGameTree(gameTree)}
          </TreeView>
        </Paper>
      ) : (
        <Typography>No valid move data available.</Typography>
      )}
    </Box>
  );
};

export default GameTree;