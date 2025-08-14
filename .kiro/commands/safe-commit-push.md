---
description: "Action: Perform a controlled commit and push of Chess Endgame Training changes to GitHub with proper documentation."
---

## Scope

Safe commit and push for Chess Endgame Training after completing:
*   **Feature Development**: New chess functionality, UI improvements, engine integration
*   **Localization Updates**: Translation additions, language support improvements
*   **Bug Fixes**: Position loading, move validation, engine response issues
*   **Documentation**: tasks.md updates, steering rule changes, README modifications
*   **Configuration**: Build settings, PWA updates, dependency changes

## Objective

Reliably commit and push changes while ensuring:
*   **Chess Functionality Intact**: Core game features still work
*   **Multi-language Support**: All translations remain consistent
*   **Engine Integration**: Stockfish and Syzygy continue functioning
*   **Progress Tracking**: User data and settings preserved
*   **Clear Documentation**: Changes properly recorded

## Process

### 1. Pre-Commit Verification (3 minutes)

1. **Test Core Chess Functionality**:
   ```bash
   npm run dev
   # Test in browser:
   # - Load a position
   # - Make valid moves
   # - Check engine analysis
   # - Verify settings save
   ```

2. **Check Git Status**:
   ```bash
   git status
   # Review all modified files
   # Ensure no unintended changes
   ```

3. **Review Changes**:
   ```bash
   git diff --stat  # Summary of changes
   git diff         # Detailed changes
   ```

### 2. Verify Chess-Specific Requirements

1. **Localization Check** (if i18n.json modified):
   - [ ] All languages have consistent keys
   - [ ] No missing translations
   - [ ] Chess terminology accurate
   - [ ] UI text fits properly

2. **Engine Integration** (if services modified):
   - [ ] Stockfish initializes correctly
   - [ ] Syzygy queries work
   - [ ] Timeout handling functions
   - [ ] Error fallbacks active

3. **Position Handling** (if chess logic modified):
   - [ ] FEN parsing works
   - [ ] Move validation accurate
   - [ ] Game state preserved
   - [ ] Progress tracking intact

### 3. Stage and Commit (2 minutes)

1. **Stage Changes**:
   ```bash
   git add .                    # All changes
   # OR specific files:
   git add code/src/static/i18n.json
   git add .kiro/specs/turkish-localization-and-enhancements/tasks.md
   ```

2. **Create Commit Message**:
   Use Chess Endgame Training specific format:
   ```
   <type>(scope): <description>
   
   [optional body]
   ```

   **Common Types**:
   - `feat`: New chess features, UI improvements
   - `fix`: Bug fixes, engine issues
   - `i18n`: Translation updates, localization
   - `perf`: Performance improvements
   - `docs`: Documentation updates
   - `config`: Build or configuration changes

   **Common Scopes**:
   - `engine`: Stockfish/Syzygy integration
   - `ui`: User interface components
   - `i18n`: Internationalization
   - `position`: Chess position handling
   - `settings`: Configuration and preferences
   - `progress`: User progress tracking

3. **Example Commit Messages**:
   ```bash
   git commit -m "i18n(turkish): add Turkish translations for settings panel"
   
   git commit -m "fix(engine): handle Stockfish timeout gracefully
   
   - Increase timeout to 5 seconds
   - Add fallback to Syzygy when Stockfish fails
   - Show loading indicator during analysis"
   
   git commit -m "feat(ui): add evaluation bar to position analysis"
   
   git commit -m "docs(tasks): update Turkish localization progress"
   ```

### 4. Push to GitHub (1 minute)

1. **Push Changes**:
   ```bash
   git push origin main
   ```

2. **Handle Issues**:
   ```bash
   # If remote has changes:
   git pull origin main --rebase
   git push origin main
   ```

### 5. Update Documentation (2 minutes)

1. **Update tasks.md**:
   ```markdown
   - [x] ~~Add Turkish translations for settings~~ ✅ 2024-01-15
   - [x] ~~Fix Stockfish timeout handling~~ ✅ 2024-01-15
   ```

2. **Add Commit Note**:
   ```markdown
   ## Recent Changes
   - 2024-01-15: Turkish settings translations completed
   - 2024-01-15: Engine timeout handling improved
   ```

## Chess-Specific Commit Guidelines

### Localization Commits
```bash
# Good examples:
git commit -m "i18n(turkish): add chess terminology translations"
git commit -m "i18n(ui): fix text overflow in Turkish settings"
git commit -m "i18n(all): update position category names"
```

### Engine Integration Commits
```bash
# Good examples:
git commit -m "fix(stockfish): increase analysis timeout to 5s"
git commit -m "feat(syzygy): add caching for tablebase responses"
git commit -m "perf(engine): optimize worker thread management"
```

### UI/UX Commits
```bash
# Good examples:
git commit -m "feat(board): add piece animation on moves"
git commit -m "fix(settings): persist theme selection correctly"
git commit -m "ui(mobile): improve board sizing on small screens"
```

### Position/Chess Logic Commits
```bash
# Good examples:
git commit -m "fix(position): correct FEN parsing for en passant"
git commit -m "feat(analysis): show best move suggestions"
git commit -m "fix(moves): validate castling rights properly"
```

## Pre-Commit Checklist

**Always Check**:
- [ ] `npm run dev` starts without errors
- [ ] Position loads and moves work
- [ ] No console errors in browser
- [ ] Settings save and load correctly

**For Localization Changes**:
- [ ] All languages updated consistently
- [ ] No missing translation keys
- [ ] UI layout works with all languages
- [ ] Chess terms translated accurately

**For Engine Changes**:
- [ ] Stockfish analysis works
- [ ] Syzygy queries succeed
- [ ] Timeout handling functions
- [ ] Error messages display properly

**For UI Changes**:
- [ ] Responsive design maintained
- [ ] Accessibility not broken
- [ ] Theme switching works
- [ ] Mobile layout acceptable

## Timeline

- **Pre-Commit Testing**: 3 minutes
- **Review and Stage**: 2 minutes
- **Commit**: 1 minute
- **Push**: 1 minute
- **Documentation**: 2 minutes
- **Total**: 9 minutes