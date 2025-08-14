# Project Structure

## Root Organization
- `code/` - Main application source and build configuration
- `docker/` - Docker development environment setup
- `twa/` - Trusted Web Activity (Android) configuration
- `firebase.json` - Firebase hosting configuration

## Source Code Structure (`code/src/`)

### Core Architecture
- `main.ts` - Application entry point, initializes services and routing
- `routes.ts` - Route definitions mapping URLs to controllers and templates
- `global.ts` - Global application state and utilities

### Controllers (`controllers/`)
- Follow MVC pattern with controller interface
- Each controller extends `BaseController` with lifecycle methods:
  - `onEnter()` - Route activation
  - `onExit()` - Route cleanup
  - `getSEOParams()` - SEO metadata
- Controllers: app, home, about, settings, list, position, promotion

### Services (`services/`)
- `services.ts` - Service initialization orchestration
- Service pattern for application logic:
  - `storage-service.ts` - Local data persistence
  - `configuration-service.ts` - App settings management
  - `stockfish-service.ts` - Chess engine integration
  - `syzygy-service.ts` - Tablebase queries
  - `sound-service.ts` - Audio management
  - `theme-switcher-service.ts` - UI theme handling
  - `alpine-service.ts` - Alpine.js integration

### Models (`model/`)
- TypeScript interfaces and classes for data structures
- `position.ts`, `move-item.ts`, `category.ts`, `subcategory.ts`
- `configuration.ts`, `endgame-database.ts`

### Static Assets (`static/`)
- `i18n.json` - Internationalization strings (en, es, ru)
- `endgamedatabase.json` - Chess position database
- `checkmate.json`, `about.json`, `sound.json` - Configuration data

### Styles (`styles/`)
- `styles.scss` - Main application styles
- `ionic.scss` - Ionic framework customizations
- `chessground.scss` - Chess board styling
- `loader.scss` - Loading animations

### Commons (`commons/`)
- Shared utilities and constants
- `utils.ts`, `constants.ts`, `event-emitter.ts`

## Public Assets (`code/public/`)
- `assets/` - Static resources organized by type:
  - `pieces/` - Chess piece SVGs (multiple themes)
  - `board/` - Board color themes
  - `icons/` - App icons and favicons
  - `audio/` - Sound effects
  - `screenshots/` - App store screenshots
- HTML page templates (page-*.html)
- PWA manifest and service worker files

## File Naming Conventions
- Kebab-case for files and directories
- TypeScript files use `.ts` extension
- Service files end with `-service.ts`
- Page templates: `page-{name}.html`
- Static JSON files in `src/static/`

## Import/Export Patterns
- Barrel exports in `index.ts` files
- Services imported from `./services`
- Models imported from `./model`
- Commons imported from `./commons`