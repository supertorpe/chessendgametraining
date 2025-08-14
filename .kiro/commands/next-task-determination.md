---
description: "Action: Determine the next most valuable task for Chess Endgame Training development through rapid assessment."
---

## Scope

Intelligent task prioritization for Chess Endgame Training covering:
*   **Core Functionality**: Position loading, move validation, engine integration
*   **User Experience**: UI improvements, progress tracking, settings
*   **Localization**: Translation updates and new language support
*   **Performance**: Loading optimization, engine efficiency, memory usage

## Objective

Efficiently determine the next development task by:
*   **Assessing Game State**: Current functionality and user experience
*   **Identifying Blockers**: Engine issues, broken features, missing translations
*   **Evaluating Impact**: User value vs development effort
*   **Maintaining Flow**: Building on recent progress

## Process

### Phase 1: Quick Assessment (2 minutes)

1. **Check tasks.md Status**:
   - Review active tasks and completion status
   - Identify any blocked or overdue items
   - Note recent achievements

2. **Test Core Functionality**:
   - Load a position and make moves
   - Check engine responses
   - Verify settings persistence

### Phase 2: Priority Analysis (3 minutes)

**Priority Levels for Chess Training**:

**P0 - Critical (Start Immediately)**:
- Game-breaking bugs (positions won't load, moves rejected)
- Engine failures (Stockfish/Syzygy not responding)
- Data loss issues (progress not saving)

**P1 - High (Current Session)**:
- UI improvements affecting user experience
- Missing translations for new features
- Performance issues affecting gameplay

**P2 - Medium (Next Session)**:
- Feature enhancements
- Code refactoring
- Documentation updates

**P3 - Low (Backlog)**:
- Nice-to-have features
- Minor optimizations
- Technical debt

### Phase 3: Task Selection (2 minutes)

**Scoring Criteria**:
1. **User Impact** (1-5): How much does this improve the chess training experience?
2. **Technical Readiness** (1-5): Can this be implemented without blockers?
3. **Effort vs Value** (1-5): Good return on development time?
4. **Continuity** (1-5): Builds on recent work?

## Chess-Specific Considerations

**Engine-Related Tasks**:
- Stockfish parameter tuning
- Syzygy integration improvements
- Engine timeout handling

**Position Database Tasks**:
- New endgame categories
- Position validation
- Database optimization

**UI/UX Tasks**:
- Board interaction improvements
- Progress visualization
- Settings panel enhancements

**Localization Tasks**:
- Turkish language support (current focus)
- Translation consistency
- RTL language preparation

## Decision Framework

### Task Categories by Impact

**High User Value**:
- Faster position loading
- Better engine analysis
- Improved progress tracking
- New language support

**Medium User Value**:
- UI polish
- Additional settings
- Performance optimizations

**Low User Value**:
- Code cleanup
- Documentation
- Developer tools

### Context Switching Rules

**Continue Current Work When**:
- Task is >50% complete
- Good momentum on feature development
- No critical issues blocking users

**Switch Context When**:
- Critical bug reported
- Engine stops working
- User data at risk

## Output Format

```markdown
# Next Task Recommendation

## Current Status
- **Last Completed**: [Recent achievement]
- **Game Health**: [Core functionality status]
- **Active Focus**: [Current development area]

## Recommended Task
**Task**: [Task name from tasks.md]
**Priority**: P[0-3] - [Reason]
**Estimated Time**: [Duration]
**User Value**: [How this helps chess players]

## Why This Task
[2-3 sentences explaining the selection rationale]

## Quick Start Steps
1. [First action to take]
2. [Key implementation step]
3. [Testing approach]

## Success Criteria
- [How to know it's complete]
- [What to test]
- [Documentation to update]

## Alternatives Considered
- [Other task]: [Why not selected]
```

## Timeline
- **Assessment**: 2 minutes
- **Analysis**: 3 minutes
- **Selection**: 2 minutes
- **Total**: 7 minutes maximum