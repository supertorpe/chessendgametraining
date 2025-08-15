// Accessibility Service for Chess Endgame Training
// Handles reduced motion, high contrast, and screen reader announcements

import { configurationService } from './configuration-service';

class AccessibilityService {
    private ariaLiveRegion: HTMLElement | null = null;

    constructor() {
        // Don't initialize immediately, wait for DOM to be ready
    }

    public init(): void {
        try {
            // Create ARIA live region for screen reader announcements
            this.createAriaLiveRegion();
            
            // Listen for configuration changes
            if (configurationService && configurationService.configuration) {
                configurationService.configuration.configurationChangedEmitter.addEventListener((event) => {
                    switch (event.field) {
                        case 'reducedMotion':
                            this.applyReducedMotion(event.config.reducedMotion);
                            break;
                        case 'highContrast':
                            this.applyHighContrast(event.config.highContrast);
                            break;
                        case 'screenReaderAnnouncements':
                            this.toggleScreenReaderAnnouncements(event.config.screenReaderAnnouncements);
                            break;
                    }
                });

                // Apply initial settings
                this.applyAccessibilitySettings();
            }
        } catch (error) {
            console.warn('Accessibility service initialization failed:', error);
        }
    }

    private createAriaLiveRegion(): void {
        // Create a hidden live region for screen reader announcements
        this.ariaLiveRegion = document.createElement('div');
        this.ariaLiveRegion.setAttribute('aria-live', 'polite');
        this.ariaLiveRegion.setAttribute('aria-atomic', 'true');
        this.ariaLiveRegion.setAttribute('class', 'sr-only');
        this.ariaLiveRegion.style.position = 'absolute';
        this.ariaLiveRegion.style.left = '-10000px';
        this.ariaLiveRegion.style.width = '1px';
        this.ariaLiveRegion.style.height = '1px';
        this.ariaLiveRegion.style.overflow = 'hidden';
        document.body.appendChild(this.ariaLiveRegion);
    }

    public applyAccessibilitySettings(): void {
        try {
            if (configurationService && configurationService.configuration) {
                const config = configurationService.configuration;
                this.applyReducedMotion(config.reducedMotion);
                this.applyHighContrast(config.highContrast);
                this.toggleScreenReaderAnnouncements(config.screenReaderAnnouncements);
            }
        } catch (error) {
            console.warn('Failed to apply accessibility settings:', error);
        }
    }

    private applyReducedMotion(enabled: boolean): void {
        const body = document.body;
        if (enabled) {
            body.classList.add('reduced-motion');
        } else {
            body.classList.remove('reduced-motion');
        }
    }

    private applyHighContrast(enabled: boolean): void {
        const body = document.body;
        if (enabled) {
            body.classList.add('high-contrast');
        } else {
            body.classList.remove('high-contrast');
        }
    }

    private toggleScreenReaderAnnouncements(enabled: boolean): void {
        if (this.ariaLiveRegion) {
            this.ariaLiveRegion.setAttribute('aria-live', enabled ? 'polite' : 'off');
        }
    }

    // Public methods for announcing events
    public announceMove(move: string, isCorrect: boolean): void {
        if (!configurationService.configuration.screenReaderAnnouncements) return;
        
        const announcement = isCorrect 
            ? `Correct move: ${move}` 
            : `Incorrect move: ${move}`;
        this.announce(announcement);
    }

    public announceGameState(state: string): void {
        if (!configurationService.configuration.screenReaderAnnouncements) return;
        
        let announcement = '';
        switch (state.toLowerCase()) {
            case 'checkmate':
                announcement = 'Checkmate achieved';
                break;
            case 'check':
                announcement = 'Check';
                break;
            case 'stalemate':
                announcement = 'Stalemate';
                break;
            case 'draw':
                announcement = 'Draw';
                break;
            default:
                announcement = state;
        }
        this.announce(announcement);
    }

    public announcePuzzleCompletion(success: boolean, moves?: number): void {
        if (!configurationService.configuration.screenReaderAnnouncements) return;
        
        const announcement = success 
            ? `Puzzle completed successfully${moves ? ` in ${moves} moves` : ''}` 
            : 'Puzzle failed, keep practicing';
        this.announce(announcement);
    }

    public announcePositionChange(positionDescription: string): void {
        if (!configurationService.configuration.screenReaderAnnouncements) return;
        this.announce(`New position: ${positionDescription}`);
    }

    public announceHint(hint: string): void {
        if (!configurationService.configuration.screenReaderAnnouncements) return;
        this.announce(`Hint: ${hint}`);
    }

    private announce(message: string): void {
        if (!this.ariaLiveRegion || !configurationService.configuration.screenReaderAnnouncements) return;
        
        // Clear previous message
        this.ariaLiveRegion.textContent = '';
        
        // Add new message after a brief delay to ensure screen readers pick it up
        setTimeout(() => {
            if (this.ariaLiveRegion) {
                this.ariaLiveRegion.textContent = message;
            }
        }, 100);
    }

    // Utility methods for checking accessibility preferences
    public isReducedMotionEnabled(): boolean {
        try {
            return configurationService && configurationService.configuration && configurationService.configuration.reducedMotion;
        } catch (error) {
            return false;
        }
    }

    public isHighContrastEnabled(): boolean {
        try {
            return configurationService && configurationService.configuration && configurationService.configuration.highContrast;
        } catch (error) {
            return false;
        }
    }

    public areScreenReaderAnnouncementsEnabled(): boolean {
        return configurationService.configuration.screenReaderAnnouncements;
    }

    // Method to add ARIA labels to chess board elements
    public addChessBoardAccessibility(): void {
        // Add ARIA labels to chess squares
        const squares = document.querySelectorAll('.cg-board square');
        squares.forEach((square, index) => {
            const file = String.fromCharCode(97 + (index % 8)); // a-h
            const rank = Math.floor(index / 8) + 1; // 1-8
            square.setAttribute('aria-label', `${file}${rank}`);
        });

        // Add role and description to the chess board
        const chessBoard = document.querySelector('.cg-board');
        if (chessBoard) {
            chessBoard.setAttribute('role', 'grid');
            chessBoard.setAttribute('aria-label', 'Chess board');
            chessBoard.setAttribute('aria-describedby', 'chess-board-description');
        }
    }

    // Method to create chess board description for screen readers
    public createChessBoardDescription(fen: string): string {
        // This would parse the FEN and create a readable description
        // For now, return a basic description
        return `Chess position with pieces arranged according to FEN: ${fen}`;
    }
}

export const accessibilityService = new AccessibilityService();