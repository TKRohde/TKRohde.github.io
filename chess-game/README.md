# Chess Anywhere: The URL-Encoded Chess Game

## Table of Contents
- [Chess Anywhere: The URL-Encoded Chess Game](#chess-anywhere-the-url-encoded-chess-game)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [How It Works](#how-it-works)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Usage](#usage)
  - [Technical Details](#technical-details)
  - [License](#license)
  - [Acknowledgments](#acknowledgments)

## Overview

Chess Anywhere is a unique implementation of the classic game of chess, where the entire game state is encoded within the URL. This innovative approach allows players to share and continue games simply by sharing a link, making it possible to play chess across any platform that can share URLs.

## Features

- **URL-Encoded Game State**: The entire chess board position, current turn, and game ID are encoded in the URL.
- **Shareable Games**: Players can share the game state by simply copying and sharing the URL.
- **Anonymous Play**: No sign-up required. Anyone with the URL can make the next move.
- **Cross-Platform**: Play on any device or platform that can open a web URL.
- **New Game Generation**: Accessing the base URL without parameters starts a new game.
- **Legal Move Validation**: Ensures all moves adhere to standard chess rules.

## How It Works

1. A player visits the Chess Anywhere website.
2. The game board is set up based on the state encoded in the URL (or a new game is started if no state is provided).
3. The current player makes a move on the board.
4. After a valid move, a new URL is generated that encodes the updated game state.
5. The player can then share this new URL with their opponent or on social media.
6. The next player uses this URL to continue the game.

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/chess-anywhere.git
   ```

2. Navigate to the project directory:
   ```
   cd chess-anywhere
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and visit `http://localhost:3000` (or the port specified in your console).

## Usage

1. To start a new game, visit the base URL of the deployed application.
2. Make a move on the chess board.
3. Copy the new URL generated after your move.
4. Share this URL with your opponent or on social media.
5. To continue a game, simply click on a shared URL or paste it into your browser.

## Technical Details

- **Frontend Framework**: React
- **State Management**: URL parameters + React state
- **Chess Logic**: chess.js library
- **UI Components**: react-chessboard, Material-UI (MUI)
- **Build Tool**: Vite
- **Backend Services**: Firebase (Firestore)
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions
- **Version Control**: Git (GitHub)
- **Code Quality**: ESLint

## License

This project is licensed under the MIT License.

## Acknowledgments

- Claude, the AI assistant from Anthropic, for generating most of the initial code and project structure
- [chess.js](https://github.com/jhlywa/chess.js) for chess logic
- [react-chessboard](https://github.com/Clariity/react-chessboard) for the chessboard UI
- All contributors and supporters of the project

---

Enjoy playing Chess Anywhere, and may the best strategist win!