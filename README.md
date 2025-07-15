# 🎯 Whack-a-Mole Game

A cheerful, cartoon-style browser game where players whack moles popping up from holes to score points! Built with pure HTML5, CSS3, and JavaScript - no frameworks or build tools required.

## 🎮 Features

### Core Gameplay
- **Fun Grid-Based Action**: 3x3 grid of holes with moles randomly popping up
- **Dual Control System**: Click with mouse or use numpad keys (1-9) for precise targeting
- **Custom Hammer Experience**: Custom hammer cursor with realistic hitting animations
- **Scoring System**: Earn 10 points per successful mole hit
- **Timer Challenge**: 30-second gameplay with 3-second countdown start
- **Bomb Mechanics**: Avoid explosive bombs that appear after 5 seconds - hitting them ends the game instantly!

### Visual Design
- **Colorful Cartoon Style**: Bright, engaging visuals optimized for all ages
- **Smooth Animations**: Mole pop-ups, hammer strikes, explosion effects, and hit bursts
- **Custom Cursor**: Hammer-themed cursor replaces default mouse pointer
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Visual Feedback**: Every interaction provides immediate visual response

### Audio System
- **Rich Sound Effects**: 
  - Special "ting" sound for successful mole hits
  - Hammer hitting sounds for all clicks and numpad presses
  - Mole pop sounds when they appear
  - Dramatic explosion sounds for bomb hits
  - Button click sounds for UI interactions
- **Background Music**: 
  - Upbeat cartoon-style ambient music on menu screen
  - Energetic gameplay music during action
- **Sound Control**: Toggle audio on/off with dedicated sound button (🔊/🔇)

### Game Features
- **High Score Persistence**: Scores saved automatically using browser localStorage
- **Game Over Modal**: Clean game over screen with final score and replay option
- **Real-time Updates**: Live score and timer display
- **Prevent Text Selection**: Optimized for gameplay without accidental text highlighting
- **Zero Dependencies**: Runs on any modern browser without installation

## 🛠️ Technologies Used

- **HTML5** — Semantic structure and game layout
- **CSS3** — Advanced styling, animations, responsive design, and visual effects
- **Vanilla JavaScript (ES6+)** — Complete game logic, event handling, audio system, and animations
- **Web Audio API** — High-quality sound playback and audio management
- **localStorage** — Persistent high score storage
- **Custom Assets** — Hand-crafted hammer cursors, icons, and programmatically generated audio files

## 📁 Project Structure

```
whack-a-mole/
├── index.html                      # Main game page with complete HTML structure
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

## 🚀 Setup & Run Instructions

### Quick Start
1. **Download the project** by cloning or downloading the repository
2. **Open `index.html`** in any modern web browser
3. **Start playing!** No installation, build process, or server setup required

### For Development/Local Hosting
```bash
# Navigate to project directory
cd whack-a-mole

# Start a local HTTP server (optional)
python3 -m http.server 5000

# Open browser and visit:
# http://localhost:5000
```

### System Requirements
- Any modern web browser (Chrome 50+, Firefox 45+, Safari 10+, Edge 15+)
- JavaScript enabled
- Audio support for sound effects (optional but recommended)

## 🎯 How to Play

### Getting Started
1. **Launch the game** by opening `index.html` in your browser
2. **Click "Start Game"** to begin (features 3-second countdown)
3. **Toggle sound** using the 🔊 button if desired

### Gameplay
1. **Hit the moles** as they randomly pop up from the 9 holes
2. **Use controls**:
   - **Mouse**: Click directly on holes with custom hammer cursor
   - **Keyboard**: Press numpad keys 1-9 for precise targeting (mapped to grid positions)
   - **Touch**: Tap on mobile devices
3. **Avoid bombs** 💣 - they appear after 5 seconds and instantly end the game
4. **Score points**: Each successful mole hit earns 10 points
5. **Beat the clock**: Try to score as much as possible in 30 seconds

### Game Flow
- **Menu Screen**: Welcome screen with ambient music and game instructions
- **Countdown**: 3-second preparation countdown with audio cues
- **Gameplay**: 30 seconds of intense mole-whacking action
- **Game Over**: Final score display with high score tracking and replay option

### Controls Reference
```
Numpad Layout (matches game grid):
┌─────┬─────┬─────┐
│  7  │  8  │  9  │  ← Top row
├─────┼─────┼─────┤
│  4  │  5  │  6  │  ← Middle row
├─────┼─────┼─────┤
│  1  │  2  │  3  │  ← Bottom row
└─────┴─────┴─────┘
```

## 🎨 Audio Generation

All sound effects are programmatically generated using Python for consistent quality and zero licensing concerns:

```bash
# Regenerate all audio files (requires Python with numpy and pillow)
cd assets/sounds
python3 generate_audio_files.py
```

This creates optimized WAV files specifically designed for web playback.

## ⚡ Performance Features

- **Instant Loading**: Direct browser execution with no build process
- **Lightweight**: Total project size under 4MB including all audio assets
- **Efficient Animations**: CSS-based animations running at smooth 60fps
- **Memory Optimized**: Proper cleanup of game timers and event listeners
- **Browser Compatibility**: Works across all modern browsers and devices
- **Offline Ready**: Can be run locally without internet connection

## 🏆 Credits

**Design & Development**: Created as a modern, accessible take on the classic Whack-a-Mole arcade game

**Audio**: All sound effects programmatically generated using Python's numpy library for web-optimized playback

**Assets**: Custom hammer cursors and icons designed for optimal user experience

## 📄 License & Browser Compatibility

### Browser Support
- ✅ **Chrome 50+** - Full support with all features
- ✅ **Firefox 45+** - Complete compatibility  
- ✅ **Safari 10+** - Optimized for iOS and macOS
- ✅ **Edge 15+** - Modern Windows browsers
- ✅ **Mobile Browsers** - Responsive touch controls

### Technical Notes
- **Web Audio API**: Required for sound effects (gracefully degrades if unavailable)
- **localStorage**: Used for high score persistence (optional feature)
- **ES6+ JavaScript**: Modern JavaScript features for optimal performance
- **No External Dependencies**: Completely self-contained for maximum compatibility

### Performance
- **Load Time**: Instant startup with static file serving
- **Memory Usage**: Optimized for low memory footprint
- **Network**: Can run entirely offline after initial download

---

**Ready to play?** Just open `index.html` and start whacking those moles! 🔨