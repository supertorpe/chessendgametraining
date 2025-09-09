---
description: "Action: Rapid assessment of Chess Endgame Training project status and next steps determination."
---

## Scope

Quick project assessment for Chess Endgame Training covering:
*   **Current Development Status**: Active tasks, recent progress, completion status
*   **Chess Functionality**: Core game features, engine integration, user experience
*   **Localization Progress**: Translation status, language support completeness
*   **Technical Health**: Build status, performance, known issues
*   **User Impact**: Critical bugs, feature requests, improvement opportunities

## Objective

Rapidly understand project state and determine next actions:
*   **Assess Current Status**: What's working, what's in progress, what's broken
*   **Identify Priorities**: Critical issues, high-value tasks, user impact
*   **Check Dependencies**: Blockers, prerequisites, external factors
*   **Plan Next Steps**: Most logical task to work on next

## Process

### Step 1: Quick Status Check (2 minutes)

1. **Read tasks.md**:
   - Current active tasks and progress
   - Recently completed items
   - Any blocked or overdue tasks
   - Priority levels and estimates

2. **Test Core Functionality** (30 seconds):
   ```bash
   npm run dev
   # Quick browser test:
   # - App loads without errors
   # - Position displays correctly
   # - Basic move works
   ```

3. **Check for Critical Issues**:
   - Console errors in browser
   - Build failures
   - Engine not responding
   - User data loss reports

### Step 2: Context Analysis (2 minutes)

1. **Review Recent Progress**:
   - What was completed in last session?
   - What momentum can be maintained?
   - Any incomplete work needing attention?

2. **Assess Current Focus Area**:
   - Turkish localization progress
   - Engine improvements
   - UI enhancements
   - Performance optimizations

3. **Check Dependencies**:
   - External API availability (Syzygy)
   - Build tool updates needed
   - Translation review requirements
   - Testing prerequisites

### Step 3: Priority Assessment (1 minute)

1. **Categorize Current State**:

   **🔴 Critical (Fix Immediately)**:
   - Game won't start or load positions
   - Moves not working or incorrectly validated
   - Engine completely unresponsive
   - User progress being lost

   **🟡 High Priority (Address Today)**:
   - Engine timeouts or slow responses
   - UI elements broken or misaligned
   - Missing translations for new features
   - Performance degradation

   **🟢 Normal (Plan for Session)**:
   - Feature enhancements
   - Code improvements
   - Documentation updates
   - Non-critical optimizations

2. **Identify Next Logical Action**:
   - Continue incomplete high-priority task
   - Address critical issues first
   - Build on recent progress
   - Start next planned feature

## Chess-Specific Assessment Points

### Core Functionality Check
- [ ] Positions load from FEN correctly
- [ ] Move validation through chess.js works
- [ ] Engine analysis provides results
- [ ] Progress tracking saves properly
- [ ] Settings persist across sessions

### Engine Integration Status
- [ ] Stockfish initializes and responds
- [ ] Syzygy queries return results
- [ ] Timeout handling works properly
- [ ] Error fallbacks function correctly
- [ ] Performance acceptable for gameplay

### Localization Health
- [ ] All supported languages display
- [ ] No missing translation keys
- [ ] Chess terminology accurate
- [ ] UI layout works with all languages
- [ ] Language switching functions

### User Experience Quality
- [ ] Board interaction smooth
- [ ] Settings panel functional
- [ ] Progress visualization clear
- [ ] Mobile layout acceptable
- [ ] Loading times reasonable

## Decision Framework

### Task Selection Priority

**P0 - Emergency** (Start immediately):
- Critical functionality broken
- User data at risk
- Security vulnerabilities
- Complete feature failures

**P1 - High** (Current session):
- Important features degraded
- User experience significantly impacted
- Localization gaps for active languages
- Performance issues affecting gameplay

**P2 - Medium** (Next session):
- Feature enhancements
- Code quality improvements
- Documentation updates
- Minor optimizations

**P3 - Low** (Backlog):
- Nice-to-have features
- Technical debt
- Experimental improvements
- Future planning

### Context Switching Guidelines

**Continue Current Work When**:
- Task >50% complete
- Good development momentum
- No critical blockers
- Clear path to completion

**Switch Context When**:
- Critical issue discovered
- Current task blocked
- Higher priority emerges
- User impact significant

## Output Format

```markdown
# Chess Endgame Training - Project Assessment

## Current Status
**Overall Health**: 🟡 Needs Attention
**Last Completed**: Position controller fix for FEN loading and list subcategory navigation
**Active Focus**: Core functionality issues - board loading and navigation
**Build Status**: ✅ Working

## Critical Issues (if any)
- **Board Not Loading**: Chessground initialization works but FEN position not properly loaded from database, causing board to show only "Yükleniyor" message
- **Navigation Issues**: List controller not properly handling subcategory selection, preventing users from seeing different difficulty levels

## Active Tasks Progress
- **Position Controller FEN Loading**: [100%] - ✅ Fixed - Added proper FEN loading from route parameters and database
- **List Controller Subcategory Navigation**: [100%] - ✅ Fixed - Added subcategory selection functionality with proper game filtering

## Recommended Next Action
**Task**: Test the fixes in browser and verify board loads correctly with proper FEN positions
**Priority**: P1
**Estimated Time**: 2 minutes
**Rationale**: Core functionality was broken - users couldn't play games. The fixes address the main blocking issues.

## Quick Start Steps
1. Navigate to /list/0/0 to see category list
2. Select a category to see subcategories (difficulty levels)
3. Select a subcategory to see available games
4. Click on a game to verify board loads with correct position

## Blockers/Dependencies
- **Browser Testing Required**: Need to verify the fixes work in actual browser environment
- **Template Updates**: May need HTML template updates to support new subcategory selection UI
```

## Common Assessment Scenarios

### Healthy Project State
- All core features working
- Recent progress on planned tasks
- No critical issues
- Clear next steps available

**Action**: Continue with planned development

### Issues Detected
- Some functionality degraded
- Performance problems
- Localization gaps
- User experience issues

**Action**: Prioritize fixes before new features

### Critical Problems
- Core functionality broken
- Build failures
- Data loss risks
- Security concerns

**Action**: Emergency response, fix immediately

### Unclear Direction
- Multiple competing priorities
- Incomplete task information
- External dependencies unclear
- Resource constraints

**Action**: Clarify requirements, break down tasks

## Timeline

- **Status Check**: 2 minutes
- **Context Analysis**: 2 minutes  
- **Priority Assessment**: 1 minute
- **Total Duration**: 5 minutes maximum

## Integration with Development Flow

**Before Starting Work**:
- Run project assessment
- Identify highest priority task
- Confirm no critical blockers
- Plan session objectives

**During Development**:
- Monitor for new issues
- Update task progress
- Note any blockers encountered
- Maintain focus on priorities

**After Completing Work**:
- Update tasks.md status
- Note any new issues discovered
- Plan next session priorities
- Commit and document changes