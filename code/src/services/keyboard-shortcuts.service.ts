// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
}

class KeyboardShortcutsService {
  private shortcuts: KeyboardShortcut[] = [];
  private eventListener: ((event: KeyboardEvent) => void) | null = null;

  constructor() {
    this.initializeDefaultShortcuts();
  }

  private initializeDefaultShortcuts() {
    // Default shortcuts will be added here
  }

  public addShortcut(shortcut: KeyboardShortcut) {
    this.shortcuts.push(shortcut);
  }

  public removeShortcut(description: string) {
    this.shortcuts = this.shortcuts.filter(shortcut => shortcut.description !== description);
  }

  public init() {
    if (this.eventListener) {
      window.removeEventListener('keydown', this.eventListener);
    }

    this.eventListener = (event: KeyboardEvent) => {
      this.handleKeyDown(event);
    };

    window.addEventListener('keydown', this.eventListener);
  }

  public destroy() {
    if (this.eventListener) {
      window.removeEventListener('keydown', this.eventListener);
      this.eventListener = null;
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    const shortcut = this.shortcuts.find(s => 
      s.key === event.key &&
      (s.ctrlKey || false) === event.ctrlKey &&
      (s.shiftKey || false) === event.shiftKey &&
      (s.altKey || false) === event.altKey &&
      (s.metaKey || false) === event.metaKey
    );

    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }

  public emit(event: string) {
    // This method will be used by controllers to trigger actions based on shortcuts
    // For now, we can use a simple event emitter pattern or a callback
    // This will be connected to the controllers later
    const customEvent = new CustomEvent(`keyboard-shortcut:${event}`, {
      detail: { event }
    });
    window.dispatchEvent(customEvent);
  }
}

export const keyboardShortcutsService = new KeyboardShortcutsService();
