# Technology Stack

## Core Technologies
- **TypeScript**: Main development language with strict type checking
- **Vite**: Build tool and development server
- **Alpine.js**: Lightweight reactive framework for UI interactions
- **Ionic Framework**: Mobile-first UI components and styling
- **Navigo**: Client-side routing

## Chess Engine Integration
- **Stockfish 16 NNUE**: WASM chess engine via lila-stockfish-web
- **Syzygy Tablebases**: Online endgame database (up to 7 pieces)
- **chess.js**: Chess logic, move validation, and game state management
- **chessground**: Interactive chess board component

## Additional Libraries
- **Alpine i18n**: Internationalization support
- **howler.js**: Audio management for move sounds
- **dom-to-image**: Board screenshot functionality
- **Ionic Storage**: Local data persistence

## Build Configuration
- **Target**: ESNext with DOM support
- **Module System**: ES modules
- **Source Maps**: Enabled for development
- **PWA**: Configured with Vite PWA plugin
- **SCSS**: Sass preprocessing for styles

## Common Commands
```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run serve

# Docker development (if preferred)
./exec.sh start
./exec.sh build-app
```

## Security Headers
- Cross-Origin-Embedder-Policy: require-corp
- Cross-Origin-Opener-Policy: same-origin (same-origin-allow-popups for Google Drive)

## External Dependencies
- Stockfish WASM files copied to assets/stockfish/
- Neural network file (nn-ecb35f70ff2a.nnue) for Stockfish NNUE