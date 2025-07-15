# Whack-a-Mole Game

## Overview

This is a classic Whack-a-Mole game built with pure HTML5, CSS3, and JavaScript - no frameworks required. The game features a 3x3 grid of holes where moles randomly appear, and players must click on them to score points within a 30-second time limit. The game includes bombs that end the game instantly when hit, adding an extra challenge element.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Pure Vanilla JavaScript**: No frameworks or libraries used, ensuring lightweight and fast performance
- **Single Page Application (SPA)**: All game logic contained within a single HTML file with linked CSS and JavaScript
- **Event-Driven Architecture**: Game state changes are handled through event listeners and callback functions
- **Modular Code Structure**: JavaScript is organized into logical sections with clear separation of concerns

### Technology Stack
- **HTML5**: Semantic markup for game structure
- **CSS3**: Styling with animations, transitions, and responsive design
- **JavaScript ES6+**: Modern JavaScript features for game logic
- **Web Audio API**: For generating sound effects (with fallback to pre-generated WAV files)
- **LocalStorage**: For persistent high score storage

## Key Components

### Game State Management
- **Global Game State**: Centralized state object tracking score, time, and game status
- **Mole States**: Array of objects tracking each hole's mole visibility and hit status
- **Bomb States**: Separate array managing bomb spawning and visibility
- **Timer System**: Countdown timer with interval-based updates

### Audio System
- **Dynamic Sound Generation**: Web Audio API for creating sound effects programmatically
- **Fallback Audio Files**: Pre-generated WAV files for browsers without Web Audio support
- **Background Music**: Ambient sounds for menu and gameplay
- **Sound Toggle**: User-controllable audio on/off functionality

### Input Handling
- **Mouse Input**: Click detection on game holes
- **Keyboard Input**: Numpad keys 1-9 for hole selection
- **Touch Input**: Mobile-responsive touch events
- **Custom Cursor**: Hammer-themed cursor with click animations

### Visual Effects
- **CSS Animations**: Smooth transitions for mole pop-ups and hit effects
- **Burst Effects**: Visual feedback when hitting moles
- **Responsive Design**: Adapts to different screen sizes
- **Game Board**: Grass-textured 3x3 grid layout

## Data Flow

1. **Game Initialization**: Load high scores from localStorage, initialize game state
2. **Game Start**: Begin countdown timer, start mole spawning logic
3. **Mole Management**: Random mole spawning with visibility timers
4. **Bomb Management**: Delayed bomb spawning after 5 seconds of gameplay
5. **Input Processing**: Handle user clicks/touches on holes
6. **Score Updates**: Increment score and update display
7. **Game End**: Stop timers, show game over modal, save high score

## External Dependencies

### Audio Files
- **Generated Audio**: Python script (`generate_audio_files.py`) creates WAV files
- **Asset Dependencies**: Hammer cursor images and sound files in `/assets/` directory
- **Web Audio API**: Browser-native audio generation (primary method)

### Storage
- **LocalStorage**: Browser-native storage for high scores
- **No Server Required**: Fully client-side application

## Deployment Strategy

### Static Hosting
- **No Build Process**: Pure HTML/CSS/JS files can be served directly
- **Asset Management**: All assets contained in `/assets/` directory
- **Cross-Browser Compatibility**: Uses standard web APIs with fallbacks

### File Structure
```
/
├── index.html          # Main game file
├── styles.css          # Game styling
├── script.js          # Game logic
└── assets/
    ├── sounds/         # Audio files
    └── images/         # Game graphics
```

### Performance Considerations
- **Lightweight**: No external libraries or frameworks
- **Efficient Animations**: CSS transforms and transitions
- **Memory Management**: Proper cleanup of timers and event listeners
- **Mobile Optimization**: Touch-friendly interface and responsive design

### Browser Requirements
- **Modern Browsers**: ES6+ support required
- **Audio Support**: Web Audio API preferred, fallback to HTML5 audio
- **LocalStorage**: For high score persistence
- **Canvas/CSS3**: For visual effects and animations