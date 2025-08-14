// Ionic service to manually define components without CDN dependency

export class IonicService {
    private static instance: IonicService;
    private initialized = false;

    static getInstance(): IonicService {
        if (!IonicService.instance) {
            IonicService.instance = new IonicService();
        }
        return IonicService.instance;
    }

    async init(): Promise<void> {
        if (this.initialized) return;

        try {
            // Import and define Ionic components manually
            const { defineCustomElements } = await import('@ionic/core/loader');
            
            // Define custom elements with local resources
            await defineCustomElements(window, {
                resourcesUrl: '/node_modules/@ionic/core/dist/ionic/'
            });

            this.initialized = true;
            console.log('Ionic components initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Ionic components:', error);
            // Fallback: create basic HTML elements for Ionic components
            this.createFallbackElements();
        }
    }

    private createFallbackElements(): void {
        // Create basic fallback elements for essential Ionic components
        const components = [
            'ion-app', 'ion-header', 'ion-toolbar', 'ion-title', 'ion-content',
            'ion-menu', 'ion-list', 'ion-item', 'ion-label', 'ion-button',
            'ion-icon', 'ion-router-outlet', 'ion-menu-toggle', 'ion-alert'
        ];

        components.forEach(tagName => {
            if (!customElements.get(tagName)) {
                customElements.define(tagName, class extends HTMLElement {
                    connectedCallback() {
                        // Basic styling for fallback elements
                        if (tagName === 'ion-app') {
                            this.style.display = 'block';
                            this.style.width = '100%';
                            this.style.height = '100%';
                        } else if (tagName === 'ion-content') {
                            this.style.display = 'block';
                            this.style.flex = '1';
                            this.style.overflow = 'auto';
                        } else if (tagName === 'ion-button') {
                            this.style.display = 'inline-block';
                            this.style.padding = '8px 16px';
                            this.style.backgroundColor = '#3880ff';
                            this.style.color = 'white';
                            this.style.border = 'none';
                            this.style.borderRadius = '4px';
                            this.style.cursor = 'pointer';
                        } else {
                            this.style.display = 'block';
                        }
                    }
                });
            }
        });

        console.log('Ionic fallback elements created');
    }
}

export const ionicService = IonicService.getInstance();