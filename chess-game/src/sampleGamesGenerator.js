// sampleGamesGenerator.js
import { Chess } from 'chess.js';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { generateId } from './utils/urlEncoder';

const famousGames = [
  {
    name: "Immortal Game",
    moves: ["e4", "e5", "f4", "exf4", "Bc4", "Qh4+", "Kf1", "b5", "Bxb5", "Nf6", "Nf3", "Qh6", "d3", "Nh5", "Nh4", "Qg5", "Nf5", "c6", "g4", "Nf6", "Rg1", "cxb5", "h4", "Qg6", "h5", "Qg5", "Qf3", "Ng8", "Bxf4", "Qf6", "Nc3", "Bc5", "Nd5", "Qxb2", "Bd6", "Bxg1", "e5", "Qxa1+", "Ke2", "Na6", "Nxg7+", "Kd8", "Qf6+", "Nxf6", "Be7#"]
  },
  {
    name: "Opera Game",
    moves: ["e4", "e5", "Nf3", "d6", "d4", "Bg4", "dxe5", "Bxf3", "Qxf3", "dxe5", "Bc4", "Nf6", "Qb3", "Qe7", "Nc3", "c6", "Bg5", "b5", "Nxb5", "cxb5", "Bxb5+", "Nbd7", "O-O-O", "Rd8", "Rxd7", "Rxd7", "Rd1", "Qe6", "Bxd7+", "Nxd7", "Qb8+", "Nxb8", "Rd8#"]
  },
  {
    name: "Evergreen Game",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4", "Bxb4", "c3", "Ba5", "d4", "exd4", "O-O", "d3", "Qb3", "Qf6", "e5", "Qg6", "Re1", "Nge7", "Ba3", "b5", "Qxb5", "Rb8", "Qa4", "Bb6", "Nbd2", "Bb7", "Ne4", "Qf5", "Bxd3", "Qh5", "Nf6+", "gxf6", "exf6", "Rg8", "Rad1", "Qxf3", "Rxe7+", "Nxe7", "Qxd7+", "Kxd7", "Bf5+", "Ke8", "Bd7+", "Kf8", "Bxe7#"]
  }
];

const createVariation = (baseGame) => {
    const game = new Chess();
    const variationPoints = [5, 10, 15].map(() => Math.floor(Math.random() * baseGame.moves.length));
  
    for (let i = 0; i < baseGame.moves.length; i++) {
      if (variationPoints.includes(i)) {
        const legalMoves = game.moves({ verbose: true });
        if (legalMoves.length > 0) {
          const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
          game.move(randomMove);
        } else {
          console.log(`No legal moves available at step ${i}. Ending variation.`);
          break;
        }
      } else {
        try {
          game.move(baseGame.moves[i]);
        } catch (error) {
          console.log(`Unable to make move ${baseGame.moves[i]} at step ${i}. Ending variation.`);
          break;
        }
      }
      
      if (game.isGameOver()) break;
    }
  
    // If the game isn't over, play random moves until it is (with a limit)
    let additionalMoves = 0;
    while (!game.isGameOver() && additionalMoves < 30) {
      const legalMoves = game.moves({ verbose: true });
      if (legalMoves.length > 0) {
        const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        game.move(randomMove);
      } else {
        break;
      }
      additionalMoves++;
    }
  
    return game;
  };
  
  const generateSampleGames = async (numberOfGames = 10) => {
    console.log(`Starting to generate ${numberOfGames} sample games...`);
    const generatedGames = [];
  
    for (let i = 0; i < numberOfGames; i++) {
      try {
        console.log(`Generating game ${i + 1}...`);
        const baseGame = famousGames[Math.floor(Math.random() * famousGames.length)];
        const gameId = generateId();
        console.log(`Game ID generated: ${gameId}`);
        const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        const initialMoveId = generateId();
  
        const gameDoc = {
          startPosition: initialFen,
          createdAt: serverTimestamp(),
          moves: {
            [initialMoveId]: {
              fen: initialFen,
              move: null,
              timestamp: serverTimestamp(),
              parentMoveId: null,
              nickname: "Initial"
            }
          }
        };
  
        // Always include the full famous game as one variation
        const fullGame = new Chess();
        let currentMoveId = initialMoveId;
        for (let move of baseGame.moves) {
          const verboseMove = fullGame.move(move, { verbose: true });
          const newMoveId = generateId();
          gameDoc.moves[newMoveId] = {
            fen: fullGame.fen(),
            move: { from: verboseMove.from, to: verboseMove.to },
            timestamp: serverTimestamp(),
            parentMoveId: currentMoveId,
            nickname: "Famous Game"
          };
          currentMoveId = newMoveId;
        }
        gameDoc.moves[currentMoveId].isEndGame = true;
        gameDoc.moves[currentMoveId].winner = fullGame.turn() === 'w' ? 'black' : 'white';
  
        // Generate 2-4 variations
        const numberOfVariations = Math.floor(Math.random() * 3) + 2;
        console.log(`Generating ${numberOfVariations} variations for game ${gameId}...`);
        for (let j = 0; j < numberOfVariations; j++) {
          let currentMoveId = initialMoveId;
          const variation = createVariation(baseGame);
          
          for (let move of variation.history({ verbose: true })) {
            const newMoveId = generateId();
            gameDoc.moves[newMoveId] = {
              fen: variation.fen(),
              move: { from: move.from, to: move.to },
              timestamp: serverTimestamp(),
              parentMoveId: currentMoveId,
              nickname: ["Alice", "Bob", "Charlie", "David", "Eve"][Math.floor(Math.random() * 5)]
            };
            currentMoveId = newMoveId;
          }
  
          // Mark the end of the game
          gameDoc.moves[currentMoveId].isEndGame = true;
          if (variation.isCheckmate()) {
            gameDoc.moves[currentMoveId].winner = variation.turn() === 'w' ? 'black' : 'white';
          } else if (variation.isDraw()) {
            gameDoc.moves[currentMoveId].winner = 'draw';
          } else {
            gameDoc.moves[currentMoveId].winner = 'unfinished';
          }
        }
  
        console.log(`Attempting to save game ${gameId} to Firestore...`);
        await setDoc(doc(db, 'games', gameId), gameDoc);
        generatedGames.push(gameId);
        console.log(`Successfully saved game ${gameId} to Firestore.`);
      } catch (error) {
        console.error(`Error generating game ${i + 1}:`, error);
      }
    }
  
    console.log(`Generation complete. ${generatedGames.length} games were successfully created.`);
    return generatedGames;
  };
  
  export default generateSampleGames;