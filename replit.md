# Whack-a-Mole Game - Repository Guide

## Overview

This is a classic Whack-a-Mole arcade game built with pure HTML5, CSS3, and JavaScript. It's a completely self-contained web application with zero external dependencies, featuring a 3x3 grid where players hit moles that randomly pop up while avoiding bombs. The game includes rich audio effects, custom animations, and persistent high score tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Pure Vanilla JavaScript**: No frameworks or libraries used - everything is built with native web technologies
- **Single Page Application**: All game logic contained in one HTML page with linked CSS and JavaScript files
- **Component-based Structure**: Game elements (moles, bombs, UI) are managed as JavaScript objects with state tracking
- **Event-driven Programming**: User interactions (mouse clicks, keyboard input, touch) drive game state changes

### File Structure
```
/
├── index.html          # Main game page and HTML structure
├── styles.css          # All styling and animations
├── script.js           # Complete game logic and state management
├── README.md           # Project documentation
└── assets/
    └── sounds/         # Audio file generation scripts
```

## Key Components

### Game State Management
- **Central Game State**: Single `gameState` object tracks score, time, playing status, and high score
- **Mole State Arrays**: Separate arrays track visibility, hit status, and effects for each of the 9 holes
- **Bomb State Arrays**: Similar state tracking for bomb entities with explosion effects
- **Local Storage**: High scores persist between sessions using browser localStorage

### Audio System
- **Dynamic Audio Generation**: Uses Web Audio API to create sound effects programmatically
- **Background Music**: Separate ambient and gameplay music tracks
- **Sound Effects**: Individual sounds for hits, misses, explosions, and UI interactions
- **Audio Toggle**: Users can mute/unmute all audio with a single button

### Visual Effects and Animations
- **Custom Cursor**: Hammer-themed cursor replaces default mouse pointer
- **CSS Animations**: Smooth transitions for mole pop-ups, explosions, and hit effects
- **Responsive Design**: Scales properly across desktop, tablet, and mobile devices
- **Visual Feedback**: Immediate visual response to all user actions

### Input Handling
- **Multi-input Support**: Mouse clicks, keyboard (numpad 1-9), and touch events
- **Coordinate Mapping**: Maps numpad keys to corresponding grid positions
- **Animation Coordination**: Input triggers both game logic and visual effects simultaneously

## Data Flow

1. **Game Initialization**: Load high score from localStorage, set up event listeners, create audio context
2. **Game Start**: 3-second countdown → activate mole spawning → start timer countdown
3. **Mole Spawning**: Random intervals create moles in random holes with auto-hide timers
4. **Bomb Introduction**: After 5 seconds, bombs start spawning alongside moles
5. **User Input**: Click/tap/keypress → check hit target → update score → trigger effects
6. **Game End**: Timer reaches zero OR bomb hit → show final score → update high score → reset state

## External Dependencies

**Zero External Dependencies**: The entire application runs without any third-party libraries, frameworks, or external services. All functionality is implemented using:
- Native HTML5 features
- CSS3 animations and transitions
- Vanilla JavaScript ES6+
- Web Audio API for sound generation
- localStorage for data persistence

## Deployment Strategy

### Hosting Requirements
- **Static Web Hosting**: Can be deployed on any static file server (GitHub Pages, Netlify, Vercel, etc.)
- **No Server Required**: Pure client-side application with no backend dependencies
- **No Build Process**: Files can be served directly without compilation or bundling

### Browser Compatibility
- **Modern Browsers**: Requires ES6+ support and Web Audio API
- **Mobile Friendly**: Responsive design works on phones and tablets
- **Progressive Enhancement**: Game degrades gracefully if audio features aren't supported

### Performance Considerations
- **Lightweight**: Minimal file sizes with no external resources to load
- **Efficient Animations**: Uses CSS transforms and transitions for smooth performance
- **Memory Management**: Properly cleans up timers and audio contexts to prevent leaks

The architecture prioritizes simplicity, performance, and broad compatibility while delivering a rich gaming experience through clever use of native web technologies.