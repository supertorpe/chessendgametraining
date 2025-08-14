# Chess Endgame Training – Development Rules

This project is a web-based chess endgame training application with structured practice positions.  
Goals: **Rapid visual progress**, **AI token efficiency**, and **tasks.md maintenance**.

---

## Core Principles

1. **Small and visible steps**  
   - Every change should provide visible progress to users.  
   - Priority: Board interaction, position solving, UI responsiveness, progress tracking.

2. **tasks.md discipline**  
   - Mark completed tasks after each development session.  
   - Add new ideas as tasks immediately (no forgetting).

3. **Efficient AI usage**  
   - Clear, targeted prompts instead of lengthy explanations.  
   - Single-shot instructions toward specific goals.

---

## Technical Quick Guide

- **Stack**: TypeScript, Vite, Alpine.js, Ionic Framework + WASM engines (Stockfish 16 NNUE, Syzygy tablebases).
- **Architecture**: MVC pattern with controllers, services, and models. Event-driven with engine isolation.
- **Deployment**: PWA-ready, static hosting compatible, Google Drive sync.

---

## Development Workflow

1. **Plan** → Write the goal in one sentence.  
2. **Develop** → Minimal changes, focused implementation.  
3. **Test** → Position loading, move validation, engine responses, progress saving.  
4. **Update tasks.md** → Mark completed + add new ideas.

---

## Safe Change Principles

- Public API/service interface removal → requires approval.  
- Experimental features → use feature flags, default disabled.  
- Engine behavior or network changes → requires approval.
- i18n changes → maintain consistency across all languages (en, es, ru).

---

## Performance and UX

- Use `requestAnimationFrame` for board animations.
- Reduce engine depth/time on low-resource devices.
- Lazy load position databases and piece themes.
- Cache Syzygy responses to minimize API calls.

---

## Chess-Specific Considerations

- Always validate moves through chess.js before engine submission.
- Maintain FEN accuracy for position sharing and analysis.
- Preserve game state during navigation and settings changes.
- Handle engine timeouts gracefully with fallback options.

---

## Quick Checklist

- [ ] Visual progress clear?  
- [ ] tasks.md updated?  
- [ ] AI token usage minimal?  
- [ ] Position solving cycle working?  
- [ ] Progress tracking functional?  
- [ ] Multi-language support maintained?