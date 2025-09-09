# Chess Endgame Training - Command Documentation

This folder contains structured command documents that provide step-by-step guidance for common development tasks in the Chess Endgame Training project. Each command is designed to be actionable, time-efficient, and specific to our chess application's needs.

## How to Use These Commands

Each command document follows a consistent structure:
- **Scope**: What the command covers
- **Objective**: What you'll achieve
- **Process**: Step-by-step instructions
- **Timeline**: Expected duration
- **Deliverables**: What you'll produce

Simply open the relevant command document and follow the process steps to complete the task efficiently.

## Available Commands

### 🔄 Development Workflow Commands

#### `atomic-change.md`
**Purpose**: Execute single, focused changes to the codebase
**When to use**: Making any code modification, bug fix, or feature addition
**Duration**: 30 minutes - 2 hours
**Key features**: 
- Chess-specific testing checklist
- Multi-language consistency checks
- Engine integration validation

#### `next-task-determination.md`
**Purpose**: Intelligently determine the next most valuable task to work on
**When to use**: Starting a development session, when current task is blocked
**Duration**: 7 minutes
**Key features**:
- Rapid project assessment
- Priority scoring system
- Context-aware recommendations

#### `project-assessment.md`
**Purpose**: Rapid assessment of project status and health
**When to use**: Beginning of work session, after breaks, when unsure of project state
**Duration**: 5 minutes
**Key features**:
- Core functionality health check
- Critical issue detection
- Next action recommendations

### 🧪 Quality Assurance Commands

#### `testing-strategy.md`
**Purpose**: Define and execute comprehensive testing for features and fixes
**When to use**: Before releases, after major changes, when implementing new features
**Duration**: 1-2 hours
**Key features**:
- Chess-specific test scenarios
- Engine integration testing
- Multi-language validation
- Performance benchmarks

#### `code-review.md`
**Purpose**: Conduct structured code reviews for pull requests
**When to use**: Before merging any code changes
**Duration**: 30 minutes
**Key features**:
- Chess logic validation
- Engine integration checks
- Localization completeness
- Performance impact assessment

### 📋 Planning & Organization Commands

#### `task-breakdown.md`
**Purpose**: Break down complex tasks into manageable sub-tasks
**When to use**: When facing large features, complex localization projects, or unclear requirements
**Duration**: 20 minutes
**Key features**:
- Chess app-specific breakdown patterns
- Localization project templates
- Realistic time estimation

#### `sprint-planning.md`
**Purpose**: Plan focused development sprints with clear goals
**When to use**: Weekly or bi-weekly planning sessions
**Duration**: 1-2 hours
**Key features**:
- Chess training-focused sprint goals
- Capacity planning for chess features
- Success metrics and quality gates

### 📝 Documentation Commands

#### `update-docs-light.md`
**Purpose**: Quick documentation updates without full review process
**When to use**: Updating task status, adding new tasks, fixing minor documentation errors
**Duration**: 30 seconds - 3 minutes
**Key features**:
- Rapid task status updates
- Chess-specific documentation patterns
- Progress tracking templates

#### `safe-commit-push.md`
**Purpose**: Controlled commit and push with proper testing and documentation
**When to use**: After completing any development work
**Duration**: 9 minutes
**Key features**:
- Chess functionality verification
- Multi-language consistency checks
- Proper commit message formatting

## Command Usage Patterns

### Daily Development Workflow
1. **Start session**: `project-assessment.md` → `next-task-determination.md`
2. **Work on task**: `atomic-change.md`
3. **Complete work**: `safe-commit-push.md` → `update-docs-light.md`

### Weekly Planning
1. **Plan sprint**: `sprint-planning.md`
2. **Break down tasks**: `task-breakdown.md` (for complex items)
3. **Track progress**: `update-docs-light.md` (daily updates)

### Quality Assurance
1. **Before merge**: `code-review.md`
2. **Before release**: `testing-strategy.md`
3. **After changes**: `project-assessment.md` (health check)

## Chess Endgame Training Specific Features

All commands are tailored for our chess application with:

### Core Chess Functionality
- Position loading and FEN validation
- Move validation through chess.js
- Game state preservation
- Progress tracking integrity

### Engine Integration
- Stockfish 16 NNUE configuration
- Syzygy tablebase queries
- Timeout handling
- Performance optimization

### Multi-Language Support
- Translation consistency (en, es, ru, tr)
- UI layout validation
- Chess terminology accuracy
- Cultural adaptation considerations

### User Experience
- Board interaction smoothness
- Settings persistence
- Mobile responsiveness
- Accessibility compliance

## Quick Reference

### Most Frequently Used Commands
- `next-task-determination.md` - Start of every session
- `atomic-change.md` - Every development task
- `safe-commit-push.md` - End of every task
- `update-docs-light.md` - Multiple times per session

### Emergency Commands
- `project-assessment.md` - When project state is unclear
- `testing-strategy.md` - When critical issues are suspected

### Planning Commands
- `task-breakdown.md` - When tasks seem too large
- `sprint-planning.md` - Weekly/bi-weekly planning

## Tips for Effective Usage

1. **Follow the timelines**: Commands are designed to be time-efficient
2. **Use checklists**: Each command provides actionable checklists
3. **Adapt as needed**: Commands are templates, adjust for specific situations
4. **Maintain consistency**: Use the same command patterns across the team
5. **Update commands**: Improve commands based on experience and project evolution

## Contributing to Commands

When you discover better ways to handle common tasks:
1. Update the relevant command document
2. Test the improved process
3. Share improvements with the team
4. Update this README if new commands are added

---

*These commands are living documents that evolve with our development practices. Keep them updated and relevant to maintain their effectiveness.*