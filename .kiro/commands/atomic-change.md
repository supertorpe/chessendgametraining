---
description: "Action: Execute a single, focused change to the Chess Endgame Training codebase following atomic change principles."
---

## Scope

This action applies to any modification made to the Chess Endgame Training project:

*   **Code Changes**: Bug fixes, UI improvements, engine integration, position database updates
*   **Localization**: Adding/updating translations in i18n.json
*   **Documentation**: README updates, steering rules, spec documents
*   **Configuration**: Vite config, PWA settings, build scripts

## Objective

Make controlled, low-risk changes that:
*   **Address One Specific Issue**: Single purpose, easily understandable
*   **Maintain Game Functionality**: Don't break position loading, move validation, or engine responses
*   **Preserve User Progress**: Ensure settings and progress tracking continue working
*   **Keep Multi-language Support**: Maintain consistency across en/es/ru translations

## Process

### 1. Before Starting

1. **Check Current Game State**:
   - Test position loading and move validation
   - Verify engine responses (Stockfish/Syzygy)
   - Confirm settings persistence

2. **Update tasks.md**:
   - Mark the task you're starting
   - Estimate completion time

### 2. During Development

1. **Follow Chess-Specific Rules**:
   - Always validate moves through chess.js
   - Maintain FEN accuracy for position sharing
   - Test with both Stockfish and Syzygy engines
   - Preserve game state during navigation

2. **Localization Consistency**:
   - If updating UI text, update all three languages (en, es, ru)
   - Use existing translation keys when possible
   - Test UI with longer text (Russian/Spanish)

3. **Performance Considerations**:
   - Use requestAnimationFrame for board animations
   - Cache Syzygy responses when possible
   - Lazy load position databases and piece themes

### 3. After Completion

1. **Test Core Functionality**:
   - Load a position and make moves
   - Check engine analysis works
   - Verify progress tracking
   - Test settings save/load

2. **Update Documentation**:
   - Mark task complete in tasks.md
   - Add brief summary of changes
   - Update any affected steering rules

## Chess-Specific Testing Checklist

- [ ] Position loads correctly from FEN
- [ ] Moves validate through chess.js
- [ ] Engine provides analysis (Stockfish/Syzygy)
- [ ] Progress tracking works
- [ ] Settings persist across sessions
- [ ] Multi-language UI displays correctly
- [ ] Board themes and piece styles load
- [ ] Sound effects work (if applicable)

## Common Change Types

**UI Improvements**:
- Board interaction enhancements
- Settings panel updates
- Progress display improvements

**Engine Integration**:
- Stockfish parameter adjustments
- Syzygy response handling
- Engine timeout management

**Localization**:
- Translation updates
- UI text additions
- Language-specific formatting

**Performance**:
- Asset loading optimization
- Animation improvements
- Memory usage reduction

## Timeline

*   **Preparation**: 5 minutes
*   **Development**: 30 minutes - 2 hours
*   **Testing**: 10 minutes
*   **Documentation**: 5 minutes