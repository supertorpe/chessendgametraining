/**
 * Utility functions for handling chess piece animations
 */

export class AnimationUtils {
  /**
   * Reset piece transformations after animation completes
   * @param element The chess piece element to reset
   */
  static resetPieceTransform(element: HTMLElement): void {
    if (!element) {
      console.warn('[AnimationUtils] No element provided to resetPieceTransform');
      return;
    }
    
    try {
      // Only reset animation-specific properties, let Chessground handle positioning
      element.style.opacity = '1';
      element.style.visibility = 'visible';
      
      // Remove any animation classes that might interfere
      element.classList.remove('anim', 'fading', 'dragging');
      
      console.log(`[AnimationUtils] Piece animation reset complete for`, element.className);
      
    } catch (error) {
      console.error('[AnimationUtils] Error resetting piece transform:', error);
    }
  }

  /**
   * Initialize animation end listeners for chess pieces
   * @param boardElement The chess board element
   */
  static initPieceAnimationHandlers(boardElement: HTMLElement): void {
    if (!boardElement) return;

    // Handle animation end events on pieces
    const handleAnimationEnd = (event: AnimationEvent) => {
      const target = event.target as HTMLElement;
      if (target && target.classList.contains('cg-piece')) {
        this.resetPieceTransform(target);
      }
    };

    // Add event listeners for all animation end events
    const events = [
      'animationend',
      'webkitAnimationEnd',
      'oanimationend',
      'MSAnimationEnd',
      'transitionend'
    ];

    events.forEach(eventName => {
      boardElement.addEventListener(eventName, handleAnimationEnd as any, { once: true });
    });
  }

  /**
   * Reset all pieces on the board
   * @param boardElement The chess board element
   */
  static resetAllPieces(boardElement: HTMLElement): void {
    if (!boardElement) return;
    
    const pieces = boardElement.querySelectorAll('.cg-piece');
    pieces.forEach(piece => this.resetPieceTransform(piece as HTMLElement));
  }
}
