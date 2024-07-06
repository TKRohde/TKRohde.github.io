# Game State Management Strategy

## Overview

This document outlines the strategy for managing game states in our URL-encoded chess game. The approach allows for multiple game threads to emerge from a single starting position while maintaining a complete history of all moves. This strategy is designed to work with Firebase as the backend storage.

## Key Components

1. **Game ID**: A unique identifier for each game.
2. **Move ID**: A unique identifier for each move within a game.
3. **Parent Move ID**: A reference to the previous move in the game thread.
4. **FEN (Forsyth–Edwards Notation)**: A standard notation for describing a particular board position of a chess game.

## Data Structure

### Firebase Document Structure

```javascript
{
  games: {
    [gameId]: {
      startPosition: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      createdAt: timestamp,
      moves: {
        [moveId]: {
          fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
          move: "e4",
          timestamp: timestamp,
          parentMoveId: null  // null for the first move, otherwise the ID of the previous move
        }
        // ... more moves
      }
    }
    // ... more games
  }
}
```

### URL Structure

The game state is encoded in the URL as follows:

```
https://example.com/chess?game=<gameId><moveId><encodedFEN>
```

## Game Flow

1. **Starting a New Game**
   - Generate a new `gameId`
   - Create an initial move entry with a `moveId` and `parentMoveId` set to `null`
   - Store the initial board position (FEN) in Firebase
   - Generate the URL for this initial state

2. **Making a Move**
   - Decode the current game state from the URL
   - Apply the move to the chess board
   - Generate a new `moveId`
   - Store the new move in Firebase, setting `parentMoveId` to the previous `moveId`
   - Generate a new URL encoding the updated game state

3. **Branching**
   - When a player makes a move from a previously existing position, a new branch is created
   - The new move gets a new `moveId` but references the existing position's `moveId` as its `parentMoveId`

## Benefits

1. **Complete History**: Each game thread's full history can be reconstructed by following the chain of `parentMoveId` references.
2. **Multiple Threads**: Supports multiple game variations emerging from any position.
3. **Efficient Querying**: Easy to find all moves that branched from a specific position.
4. **Compact URLs**: Only `gameId`, current `moveId`, and FEN are needed in the URL to represent the full game state.
5. **Flexibility**: Additional metadata can be added to each move without affecting the overall structure.

## Implementation Details

### Generating IDs

Use a UUID generator and take the first 6 characters for both `gameId` and `moveId`:

```javascript
import { v4 as uuidv4 } from 'uuid';

const generateId = () => uuidv4().slice(0, 6);
```

### URL Encoding/Decoding

```javascript
// Encoding
const encodeGameState = (gameId, moveId, fen) => {
  const encodedFen = btoa(fen).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${gameId}${moveId}${encodedFen}`;
};

// Decoding
const decodeGameState = (encodedState) => {
  const gameId = encodedState.slice(0, 6);
  const moveId = encodedState.slice(6, 12);
  const encodedFen = encodedState.slice(12);
  const fen = atob(encodedFen.replace(/-/g, '+').replace(/_/g, '/'));
  return { gameId, moveId, fen };
};
```

### Firebase Operations

```javascript
// Starting a new game
const startNewGame = async () => {
  const gameId = generateId();
  const moveId = generateId();
  const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  
  await setDoc(doc(db, 'games', gameId), {
    startPosition: initialFen,
    createdAt: serverTimestamp(),
    moves: {
      [moveId]: {
        fen: initialFen,
        move: null,
        timestamp: serverTimestamp(),
        parentMoveId: null
      }
    }
  });

  return encodeGameState(gameId, moveId, initialFen);
};

// Making a move
const makeMove = async (gameId, parentMoveId, fen, move) => {
  const newMoveId = generateId();
  
  await updateDoc(doc(db, 'games', gameId), {
    [`moves.${newMoveId}`]: {
      fen: fen,
      move: move,
      timestamp: serverTimestamp(),
      parentMoveId: parentMoveId
    }
  });

  return encodeGameState(gameId, newMoveId, fen);
};
```

## Considerations

1. **Data Growth**: This approach can lead to rapid data growth. Implement cleanup strategies for inactive game threads.
2. **Security Rules**: Use Firebase security rules to limit the number of moves per game and prevent unauthorized modifications.
3. **Archiving**: Consider implementing a system to archive old or completed games to manage database size.

By following this strategy, the application can support the unique URL-sharing feature while maintaining a complete history of all game variations in Firebase. This approach provides a flexible and powerful way to represent the complex, branching nature of chess games in both the URL and the database structure.