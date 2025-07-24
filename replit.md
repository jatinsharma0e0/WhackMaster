# Overview

This is a browser-based Whack-a-Mole game built with pure HTML5, CSS3, and vanilla JavaScript. The game features a 3x3 grid where players hit moles and avoid bombs to score points within a 30-second time limit. It includes custom animations, sound effects, high score persistence, and responsive design optimized for both desktop and mobile devices.

The project has been successfully migrated from Replit Agent to the standard Replit environment with all dependencies installed and verified working.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

- **2025-07-24**: Successfully migrated project from Replit Agent to Replit environment
- **2025-07-24**: Created comprehensive README.md with project documentation, screenshots, and installation instructions
- **2025-07-24**: Verified all dependencies (numpy, pillow) are properly installed
- **2025-07-24**: Confirmed game is fully functional and running on port 5000

# System Architecture

## Frontend Architecture
The application uses a **pure client-side architecture** with no frameworks or build tools:
- **HTML5** provides semantic structure and game layout
- **CSS3** handles all styling, animations, and responsive design
- **Vanilla JavaScript (ES6+)** manages complete game logic, state management, and DOM manipulation

This approach was chosen for:
- Zero dependencies and immediate browser compatibility
- Lightweight deployment without build processes
- Educational clarity and maintainability
- Universal browser support

## State Management
Game state is managed through plain JavaScript objects:
- `gameState` - Core game variables (score, time, playing status)
- `moles` array - Individual mole states for 9 grid positions
- `bombs` array - Bomb states and hit detection
- Global variables for timers, audio, and input handling

## Audio System
Uses **Web Audio API** for sound management:
- Programmatically generated audio using sine waves and frequency modulation
- Background music support for menu and gameplay
- Sound toggle functionality with localStorage persistence
- Multiple concurrent audio tracks (hits, pops, explosions, background)

# Key Components

## Game Board (3x3 Grid)
- 9 interactive holes with mole/bomb spawn logic
- Custom hammer cursor with rotation animations
- Dual input system: mouse clicks and numpad keys (1-9)
- Visual feedback for all interactions

## Scoring System
- 10 points per successful mole hit
- High score persistence using `localStorage`
- Real-time score and timer display
- Game over modal with final results

## Animation Engine
- CSS-based animations for mole pop-ups, hammer strikes, and explosions
- Custom cursor overlay with rotation effects
- Smooth transitions and visual feedback
- Mobile-optimized touch interactions

## Timer and Game Flow
- 30-second gameplay with 3-second countdown
- Automatic game start/stop mechanisms
- Bomb spawning after 5 seconds with escalating difficulty
- Clean game state reset between rounds

# Data Flow

## Game Loop
1. **Initialization**: Set up DOM elements, load high scores, initialize audio
2. **Game Start**: Begin countdown, start mole spawning timers
3. **Gameplay**: Handle user input, update score, manage mole/bomb lifecycles
4. **Game End**: Stop all timers, display results, save high score
5. **Reset**: Clean state for next round

## Input Processing
- Mouse clicks and numpad keypresses map to grid positions (0-8)
- Input validation ensures hits only register on visible moles/bombs
- Visual and audio feedback for all interactions
- Prevention of accidental text selection during gameplay

## Audio Management
- Dynamic audio file generation using Web Audio API
- Separate background music tracks for menu and gameplay
- Sound effect layering for simultaneous audio events
- User-controlled audio toggle with state persistence

# External Dependencies

## Storage
- **localStorage** - High score persistence and sound preferences
- No external databases or cloud storage required

## Assets
- Custom hammer cursor images (PNG format)
- Programmatically generated audio files using Python script
- All assets are self-contained within the project

## Browser APIs
- **Web Audio API** - Sound generation and playback
- **localStorage API** - Data persistence
- **DOM APIs** - Element manipulation and event handling
- **CSS Animation APIs** - Visual effects

# Deployment Strategy

## Static Hosting
The application is designed for **static file hosting**:
- No server-side requirements
- Compatible with GitHub Pages, Netlify, Vercel, or any web server
- All dependencies are included in the project files

## Browser Compatibility
- Modern browsers with ES6+ support required
- Web Audio API support needed for sound features
- Responsive design works on desktop, tablet, and mobile
- No transpilation or polyfills required

## Performance Optimization
- Minimal file sizes with pure vanilla JavaScript
- Efficient DOM manipulation without virtual DOM overhead
- CSS animations leverage hardware acceleration
- localStorage provides instant data access without network requests

The architecture prioritizes simplicity, performance, and universal compatibility while delivering a complete gaming experience with rich audio-visual feedback.