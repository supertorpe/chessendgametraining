// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import { EventEmitter } from '../commons';

export interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean; // Cmd key on Mac
    action: () => void;
    description?: string;
}

class KeyboardShortcutsService {
    private shortcuts: KeyboardShortcut[] = [];
    private eventEmitter: EventEmitter<string>;
    private initialized = false;

    constructor() {
        this.eventEmitter = new EventEmitter<string>();
    }

    public init(): void {
        if (this.initialized) {
            return;
        }

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.initialized = true;
    }

    public destroy(): void {
        if (!this.initialized) {
            return;
        }

        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        this.initialized = false;
    }

    public addShortcut(shortcut: KeyboardShortcut): void {
        // Check if shortcut already exists
        const exists = this.shortcuts.some(s => 
            s.key === shortcut.key &&
            s.ctrl === shortcut.ctrl &&
            s.shift === shortcut.shift &&
            s.alt === shortcut.alt &&
            s.meta === shortcut.meta
        );

        if (!exists) {
            this.shortcuts.push(shortcut);
        }
    }

    public removeShortcut(shortcut: KeyboardShortcut): void {
        this.shortcuts = this.shortcuts.filter(s => 
            !(s.key === shortcut.key &&
              s.ctrl === shortcut.ctrl &&
              s.shift === shortcut.shift &&
              s.alt === shortcut.alt &&
              s.meta === shortcut.meta)
        );
    }

    public addEventListener(listener: (event: string) => void): void {
        this.eventEmitter.addEventListener(listener);
    }

    public removeEventListener(listener: (event: string) => void): void {
        this.eventEmitter.removeEventListener(listener);
    }

    private handleKeyDown(event: KeyboardEvent): void {
        // Prevent shortcuts from triggering when typing in input fields
        if ((event.target as HTMLElement).tagName === 'INPUT' || 
            (event.target as HTMLElement).tagName === 'TEXTAREA' ||
            (event.target as HTMLElement).isContentEditable) {
            return;
        }

        const shortcut = this.shortcuts.find(s => 
            s.key.toLowerCase() === event.key.toLowerCase() &&
            !!s.ctrl === event.ctrlKey &&
            !!s.shift === event.shiftKey &&
            !!s.alt === event.altKey &&
            !!s.meta === event.metaKey
        );

        if (shortcut) {
            event.preventDefault();
            shortcut.action();
            this.eventEmitter.notify(shortcut.key); // Notify with the key for simplicity
        }
    }

    // Common shortcut definitions can be added here or in a separate config file
    public addCommonShortcuts(): void {
        // Example: Add a shortcut for 'Ctrl+S' to save (if applicable)
        // this.addShortcut({
        //     key: 's',
        //     ctrl: true,
        //     action: () => { console.log('Save action triggered'); },
        //     description: 'Save current progress'
        // });

        // Example: Add a shortcut for 'Escape' to close modals or go back
        this.addShortcut({
            key: 'Escape',
            action: () => { 
                this.eventEmitter.notify('escape-pressed'); 
            },
            description: 'Close modal or go back'
        });

        // Example: Add a shortcut for 'ArrowLeft' and 'ArrowRight' for navigation
        this.addShortcut({
            key: 'ArrowLeft',
            action: () => { 
                this.eventEmitter.notify('navigate-previous'); 
            },
            description: 'Go to previous position'
        });

        this.addShortcut({
            key: 'ArrowRight',
            action: () => { 
                this.eventEmitter.notify('navigate-next'); 
            },
            description: 'Go to next position'
        });
        
        // Add more common shortcuts as needed
    }
}

export const keyboardShortcutsService = new KeyboardShortcutsService();
