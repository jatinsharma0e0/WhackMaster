# 🔨 Whack-a-Mole Game 🔨

A fun, classic Whack-a-Mole game built with pure HTML5, CSS3, and JavaScript - completely self-contained with zero dependencies! Features exciting bomb mechanics, custom hammer animations, and rich audio feedback.

## Features

✅ **Complete Game Mechanics**
- 30-second timer gameplay with 3-second countdown start
- 3x3 grid of holes with random mole spawning
- Bomb system adds challenge (avoid the 💣!)
- Score tracking with persistent high scores
- Instant game over when hitting bombs

✅ **Visual Design & Animations**
- Custom hammer cursor replaces default mouse cursor
- Realistic hammer hitting animations for mouse clicks and numpad controls
- Cute mole pop-up animations with smooth transitions
- Explosion animations for bomb hits
- Burst effects and impact animations for successful hits
- Fully responsive design optimized for all screen sizes
- Professional game board with visual feedback

✅ **Rich Audio System**
- Upbeat cartoon-style background music during gameplay
- Gentle ambient music on menu screen
- Satisfying "ting" sound for successful mole hits
- Hammer hitting sound for all clicks and numpad interactions
- Mole pop sounds when they appear
- Dramatic explosion sound for bombs
- Game over sound sequence
- Button click sounds for UI interactions
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

### Controls & Interactions
- **Mouse**: Click directly on holes with custom hammer cursor
- **Keyboard**: Use numpad keys 1-9 for precise hole targeting (mapped to grid positions)
- **Touch**: Fully responsive touch controls for mobile devices
- **Sound Toggle**: Click the 🔊 button to enable/disable all audio
- **Visual Feedback**: Every interaction triggers appropriate animations and sounds

## Running the Game

Simply open `index.html` in any modern web browser - no installation or build process required!

For development or local hosting:
```bash
python3 -m http.server 5000
# Then visit http://localhost:5000
```

## File Structure

```
├── index.html                      # Main game page (complete HTML structure)
├── styles.css                      # All CSS styles, animations, and responsive design  
├── script.js                       # Complete game logic, audio system, and interactions
├── assets/
│   ├── hammer-cursor.png           # Custom hammer cursor (small size)
│   ├── hammer-cursor-128.png       # Custom hammer cursor (large size)
│   ├── hammer-icon.png             # Hammer icon for game title
│   └── sounds/
│       ├── hit.wav                 # Original hit sound effect (9KB)
│       ├── ting.wav                # Special metallic ting for successful hits (22KB)
│       ├── mole_pop.wav            # Mole pop sound (13KB)
│       ├── hammer_hit.wav          # Hammer hitting sound for clicks (13KB)
│       ├── explosion.wav           # Bomb explosion sound (35KB)
│       ├── game_over.wav           # Game over sound sequence (220KB)
│       ├── background_music.wav    # Energetic gameplay music (265KB)
│       ├── ambient_music.wav       # Upbeat cartoon-style menu music (~2.6MB)
│       ├── button_click.wav        # Button click sound for UI (7KB)
│       └── generate_audio_files.py # Python script to regenerate audio files
├── pyproject.toml                  # Python dependencies for audio generation
└── README.md                       # Complete project documentation
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

## Audio Generation

All audio files are generated programmatically using Python. To regenerate the audio files:

```bash
cd assets/sounds
python3 generate_audio_files.py
```

This creates high-quality WAV files optimized for web playback without any external dependencies.

## Performance Features

- **Instant Loading**: No build process or bundle loading
- **Zero Dependencies**: Runs entirely in the browser
- **Lightweight**: Total project size under 4MB including all audio
- **Efficient Animations**: CSS-based animations with smooth 60fps performance
- **Memory Optimized**: Proper cleanup of timeouts and event listeners

## Development History

This game was successfully converted from a React/TypeScript implementation to pure HTML/CSS/JavaScript while preserving 100% of the original functionality:

- All React components → Pure HTML elements with vanilla JavaScript
- React state management → JavaScript variables and DOM manipulation
- JSX → Standard HTML with dynamic content generation
- TypeScript → Modern JavaScript (ES6+) with proper error handling
- Tailwind CSS → Custom CSS with identical visual design
- React hooks → Standard event listeners and game timers
- Build tools → Direct browser execution

The conversion maintains identical gameplay, visuals, audio, and user experience while eliminating all build tools and external dependencies.