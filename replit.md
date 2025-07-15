# Whack-a-Mole Game

## Overview

Successfully converted from React/TypeScript to pure HTML5, CSS3, and JavaScript. The game is now completely self-contained with no dependencies, build tools, or frameworks required. All original features are preserved including animations, sound effects, scoring, and responsive design. 

**NEW FEATURE**: Added bomb functionality that enhances gameplay challenge - bombs appear after 5 seconds of gameplay and explode on contact, instantly ending the game. This adds strategic depth where players must carefully identify targets before clicking.

The game runs by simply opening index.html in any modern web browser.

## User Preferences

Preferred communication style: Simple, everyday language.
Visual preferences: Custom hammer icon instead of emoji characters.
Custom cursor: Custom hammer cursor (hammer-cursor.png) replaces default mouse cursor throughout the game with hotspot positioned at the center (50, 50) and cursor overlay offset by (-50px, -45px).
Cursor animation: Uses the exact same hammer hitting animation as numpad controls on any click anywhere on the page. The hammer appears at click position, performs the full hitting motion with rotation and scaling effects, and shows an impact explosion, creating a consistent hitting experience across the entire canvas.
Hammer animations: Realistic hammer hitting animations for both numpad controls (keys 1-9) and mouse clicks anywhere on the page, with rotation effects and impact explosions. All interactions now use the same consistent hammer animation system.

## System Architecture

### Application Architecture
- **Frontend**: Pure HTML5, CSS3, and JavaScript (ES6+)
- **No Framework**: Vanilla JavaScript with DOM manipulation
- **Styling**: Custom CSS with CSS Grid, Flexbox, and CSS animations
- **State Management**: JavaScript variables with localStorage for persistence
- **Audio System**: Web Audio API for programmatic sound generation
- **Keyboard Controls**: Numpad keys 1-9 for direct hole targeting with animated hammer strikes
- **Responsive Design**: CSS media queries for mobile/tablet/desktop
- **Zero Dependencies**: No build tools, package managers, or external libraries required

### Deployment Architecture
- **Static Files**: Three files (index.html, styles.css, script.js)
- **Web Server**: Any HTTP server (Python http.server, Apache, Nginx, etc.)
- **Browser Compatibility**: Modern browsers with Web Audio API support
- **Performance**: Instant loading with no bundle size concerns

## Key Components

### Game Logic
- **Game State Management**: Handles game timing, score tracking, and high score persistence
- **Mole Management**: Controls mole visibility, hit detection, and visual effects
- **Bomb System**: Manages bomb spawning (starts after 5 seconds), explosion detection, and instant game over
- **Local Storage**: Persists high scores between sessions

### UI Components
- **Game Board**: 3x3 grid of mole holes with click interactions
- **Score Display**: Real-time score and timer updates
- **Game Controls**: Start/restart button functionality
- **Responsive Design**: Mobile-friendly interface

### Backend Infrastructure
- **Storage Interface**: Abstracted storage layer (IStorage) for future database integration
- **Route Structure**: Organized API routes under /api prefix
- **Error Handling**: Centralized error handling middleware
- **Request Logging**: Detailed API request logging for development

## Data Flow

### Game Flow
1. User clicks start button to begin game
2. Timer starts countdown from 30 seconds
3. Moles randomly appear and disappear at intervals
4. User clicks moles to increment score
5. Game ends when timer reaches zero
6. High score is saved to localStorage if beaten

### Client-Server Communication
- **API Client**: Configured fetch-based client with error handling
- **Query Management**: TanStack Query for server state caching
- **Authentication Ready**: Cookie-based session management prepared

## External Dependencies

**None** - The application is completely self-contained with zero external dependencies:

- **No npm packages**: No package.json, node_modules, or build tools required
- **No CDN resources**: All code is contained in local files
- **No external APIs**: All sounds are stored as WAV files in the assets/sounds folder
- **No fonts or assets**: Uses system fonts and emoji characters for graphics
- **Browser APIs only**: Leverages native HTML5, CSS3, and JavaScript Web APIs

## Deployment Strategy

### Development
- **Local Testing**: Open index.html directly in browser or use simple HTTP server
- **HTTP Server**: `python3 -m http.server 3000` or any static file server
- **Live Reload**: Browser dev tools or manual refresh for changes

### Production  
- **Static Hosting**: Deploy to any static hosting service (Netlify, Vercel, GitHub Pages)
- **CDN**: Can be served from any CDN or static file server
- **No Build Step**: Files are ready for production as-is
- **Performance**: Instant loading with minimal file sizes

### File Structure
```
├── index.html              # Complete game interface (5.8KB)
├── styles.css              # All styling and animations (14KB)  
├── script.js               # Game logic and audio system (24KB)
├── assets/
│   ├── hammer-icon.png         # Custom colorful hammer icon for title
│   └── sounds/
│       ├── hit.wav                # Hit sound effect (9KB)
│       ├── mole_pop.wav           # Mole pop sound (13KB) 
│       ├── game_over.wav          # Game over sound sequence (220KB)
│       ├── background_music.wav   # Energetic gameplay music (265KB)
│       ├── ambient_music.wav      # Gentle menu music (706KB)
│       ├── explosion.wav          # Bomb explosion sound effect (35KB)
│       └── generate_audio_files.py # Script to regenerate audio files
└── README.md               # Documentation
```

The application is completely self-contained with no dependencies, making it extremely portable and easy to deploy anywhere static files are supported.