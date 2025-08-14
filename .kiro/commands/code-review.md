---
description: "Action: Conduct structured code review for Chess Endgame Training pull requests."
---

## Scope
- **Chess Logic**: Move validation, position handling, game state
- **Engine Integration**: Stockfish and Syzygy implementations
- **UI Components**: Board interaction, settings, progress tracking
- **Localization**: Translation updates and new language support
- **Performance**: Loading optimization, memory management

## Prerequisites
- [ ] Development server runs without errors
- [ ] Core chess functionality tested manually
- [ ] No console errors in browser
- [ ] PR description includes:
  - Purpose of changes
  - Testing steps performed
  - Screenshots for UI changes

## Chess-Specific Review Checklist

### 1. Chess Logic & Game State
- [ ] Move validation uses chess.js correctly
- [ ] FEN strings handled properly
- [ ] Game state preserved during navigation
- [ ] Position analysis accuracy maintained
- [ ] No chess rule violations introduced

### 2. Engine Integration
- [ ] Stockfish parameters configured correctly
- [ ] Syzygy fallback logic works
- [ ] Engine timeouts handled gracefully
- [ ] No memory leaks in engine workers
- [ ] Error handling for engine failures

### 3. User Interface
- [ ] Board interaction remains smooth
- [ ] Piece dragging/clicking works
- [ ] Settings changes persist
- [ ] Progress tracking functions
- [ ] Responsive design maintained

### 4. Localization
- [ ] New UI text has translations for all languages
- [ ] Translation keys follow naming conventions
- [ ] No hardcoded strings in components
- [ ] Text fits properly in UI elements
- [ ] Chess terminology accurate in all languages

### 5. Performance
- [ ] No unnecessary re-renders
- [ ] Efficient data structures used
- [ ] Assets loaded lazily when possible
- [ ] Memory usage reasonable
- [ ] No blocking operations on main thread

## Code Quality Standards

### TypeScript
- [ ] Strict type checking enabled
- [ ] No `any` types without justification
- [ ] Interfaces defined for data structures
- [ ] Proper error handling with types

### Alpine.js Components
- [ ] Reactive data properly structured
- [ ] Event handlers bound correctly
- [ ] Component lifecycle managed
- [ ] No memory leaks in watchers

### Services Pattern
- [ ] Service interfaces maintained
- [ ] Dependency injection used properly
- [ ] Service initialization order correct
- [ ] Error propagation handled

## Review Process

### For Reviewers
1. **Quick Functionality Check** (5 min):
   - Pull branch and run `npm run dev`
   - Load a position and make moves
   - Check for console errors

2. **Code Review** (15-30 min):
   - Focus on changed files
   - Check chess-specific logic carefully
   - Verify localization completeness
   - Look for performance impacts

3. **Testing** (10 min):
   - Test the specific feature/fix
   - Try edge cases
   - Check different languages
   - Verify settings persistence

### For Authors
1. **Self-Review Checklist**:
   - [ ] Tested with both Stockfish and Syzygy
   - [ ] Checked all three languages (en, es, ru)
   - [ ] Verified settings save/load
   - [ ] No console errors or warnings
   - [ ] Performance impact assessed

2. **Documentation**:
   - [ ] Updated tasks.md if applicable
   - [ ] Added comments for complex chess logic
   - [ ] Updated steering rules if patterns changed

## Common Chess App Issues

**Chess Logic**:
- Incorrect move validation
- FEN parsing errors
- Game state corruption
- Position analysis bugs

**Engine Integration**:
- Worker thread memory leaks
- Timeout handling failures
- Parameter passing errors
- Response parsing issues

**Localization**:
- Missing translation keys
- Hardcoded strings
- Text overflow in UI
- Inconsistent chess terminology

**Performance**:
- Unnecessary position recalculations
- Memory leaks in game loops
- Blocking engine operations
- Inefficient board rendering

## Approval Criteria

**Must Have**:
- [ ] Core chess functionality works
- [ ] No regression in existing features
- [ ] All languages display correctly
- [ ] Performance acceptable
- [ ] Code follows project patterns

**Nice to Have**:
- [ ] Performance improvements
- [ ] Code simplification
- [ ] Better error messages
- [ ] Enhanced user experience

## Chess-Specific Testing Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Test production build
npm run serve

# Check TypeScript
npx tsc --noEmit
```

## Post-Review Actions

**After Approval**:
- [ ] Merge to main branch
- [ ] Test deployed version
- [ ] Update tasks.md completion status
- [ ] Monitor for any user reports

**If Issues Found**:
- [ ] Create follow-up tasks
- [ ] Document known limitations
- [ ] Plan fixes for next iteration

## Timeline

- **Initial Review**: 30 minutes
- **Author Fixes**: Variable
- **Re-review**: 15 minutes
- **Final Approval**: 5 minutes