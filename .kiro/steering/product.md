# Product Overview

Chess Endgame Training is a web application for practicing chess endgames with organized positions and challenges.

## Core Features
- Practice against Syzygy tablebases or Stockfish 16 NNUE engine
- Personal progress tracking for each position
- Automatic solving and move review capabilities
- Mate and draw challenges for both white and black
- Google Drive sync for configurations and progress
- Manual mode for exploring alternative lines
- Multi-language support (English, Spanish, Russian)
- Multiple themes and piece styles
- Board image capture and FEN/PGN export

## Distribution
- Progressive Web App (PWA) at chess-endgame-trainer.mooo.com
- Android app via Google Play Store
- Trusted Web Activity (TWA) for Android

## URL Structure
- Custom positions: `/fen/FEN_STRING/TARGET` (TARGET: checkmate or draw)
- Random checkmate puzzles: `/checkmate/N` (N = moves to mate)
- Role switching: `?player=w` parameter

## Target Users
Chess players looking to improve their endgame skills through structured practice with engine assistance and progress tracking.