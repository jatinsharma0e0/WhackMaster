# 🔨 Whack-a-Mole Game 🔨

A fun, classic Whack-a-Mole game built with pure HTML5, CSS3, and JavaScript - no frameworks required!

## Features

✅ **Complete Game Mechanics**
- 30-second timer gameplay with 3-second countdown start
- 3x3 grid of holes with random mole spawning
- Bomb system adds challenge (avoid the 💣!)
- Score tracking with persistent high scores
- Instant game over when hitting bombs

✅ **Visual Design**
- Cute mole animations (pop-up effects)
- Hammer cursor with click animations
- Burst effects when hitting moles
- Responsive design for all devices
- Grass-textured game board

✅ **Audio System**
- Background music during gameplay
- Ambient sounds on menu screen
- Hit sound effects when whacking moles
- Mole pop sounds when they appear
- Game over sound sequence
- Sound toggle button (🔊/🔇)

✅ **Controls**
- **Mouse**: Click on holes to whack moles
- **Keyboard**: Use numpad keys 1-9 to hit corresponding holes
- **Touch**: Fully responsive for mobile devices

✅ **Game Features**
- Real-time score updates (+10 points per hit)
- High score persistence (saved in localStorage)
- Game over modal with play again option
- Visual feedback for all interactions

## How to Play

1. Click "Start Game" to begin (3-second countdown before starting)
2. Hit moles as they randomly pop up from holes
3. **Avoid bombs** 💣 - they appear after 5 seconds and end the game instantly
4. Each successful hit scores 10 points
5. Try to get the highest score in 30 seconds!
6. Beat your high score and challenge your friends

### Controls
- **Mouse**: Click directly on holes
- **Keyboard**: Use numpad keys 1-9 for quick targeting
- **Touch**: Fully responsive for mobile devices

## Running the Game

Simply open `index.html` in any modern web browser - no installation or build process required!

For development or local hosting:
```bash
python3 -m http.server 3000
# Then visit http://localhost:3000
```

## File Structure

```
├── index.html              # Main game page with complete HTML structure
├── styles.css              # All CSS styles, animations, and responsive design  
├── script.js               # Complete game logic, audio system, and interactions
├── assets/
│   └── sounds/
│       ├── hit.wav                # Hit sound effect (9KB)
│       ├── mole_pop.wav           # Mole pop sound (13KB)
│       ├── game_over.wav          # Game over sound sequence (220KB)
│       ├── background_music.wav   # Energetic gameplay music (265KB)
│       ├── ambient_music.wav      # Gentle menu music (706KB)
│       └── generate_audio_files.py # Script to regenerate audio files
└── README.md               # This file
```

## Technical Details

- **No Dependencies**: Pure HTML5, CSS3, and ES6+ JavaScript
- **Progressive Enhancement**: Works without JavaScript (basic layout)
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Audio Files**: High-quality WAV audio files for all sound effects and music
- **Local Storage**: High score persistence across browser sessions
- **Modern Browser Support**: Uses modern JavaScript features for best performance

## Browser Compatibility

- Chrome 50+ ✅
- Firefox 45+ ✅  
- Safari 10+ ✅
- Edge 15+ ✅
- Mobile browsers ✅

## Converting from React

This game was successfully converted from a React/TypeScript implementation to pure HTML/CSS/JavaScript while preserving 100% of the original functionality:

- All React components → Pure HTML elements
- React state management → JavaScript variables and DOM manipulation
- JSX → Standard HTML
- TypeScript → Modern JavaScript (ES6+)
- Tailwind CSS → Custom CSS with same visual design
- React hooks → Standard event listeners and timers

The conversion maintains identical gameplay, visuals, audio, and user experience while removing all build tools and dependencies.