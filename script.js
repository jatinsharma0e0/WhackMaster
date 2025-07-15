/**
 * Whack-a-Mole Game - Pure JavaScript Implementation
 * Converted from React to vanilla JavaScript while preserving all features
 */

// Game State
let gameState = {
    isPlaying: false,
    score: 0,
    timeLeft: 30,
    highScore: parseInt(localStorage.getItem('whackMoleHighScore') || '0')
};

// Mole States (9 holes, indexed 0-8)
let moles = Array(9).fill(null).map(() => ({
    isVisible: false,
    isHit: false,
    showHitEffect: false
}));

// Game Control Variables
let gameInterval = null;
let moleTimeouts = [];
let isSoundEnabled = true;
let audioContext = null;
let backgroundMusicInterval = null;
let ambientSoundInterval = null;

// DOM Elements
let elements = {};

// Numpad key mapping (1-9 to grid positions)
const keyMap = {
    '1': 6, '2': 7, '3': 8, // Bottom row
    '4': 3, '5': 4, '6': 5, // Middle row
    '7': 0, '8': 1, '9': 2  // Top row
};

/**
 * Initialize the game when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    createGameBoard();
    initializeEventListeners();
    updateHighScoreDisplay();
    startAmbientSound();
});

/**
 * Get references to all DOM elements
 */
function initializeElements() {
    elements = {
        currentScore: document.getElementById('currentScore'),
        timeLeft: document.getElementById('timeLeft'),
        highScore: document.getElementById('highScore'),
        startButton: document.getElementById('startButton'),
        gameStatus: document.getElementById('gameStatus'),
        soundToggle: document.getElementById('soundToggle'),
        gameBoard: document.getElementById('gameBoard'),
        holesGrid: document.querySelector('.holes-grid'),
        gameOverModal: document.getElementById('gameOverModal'),
        finalScore: document.getElementById('finalScore'),
        newHighScoreMsg: document.getElementById('newHighScoreMsg'),
        playAgainButton: document.getElementById('playAgainButton'),
        closeModalButton: document.getElementById('closeModalButton')
    };
}

/**
 * Create the 3x3 grid of holes dynamically
 */
function createGameBoard() {
    elements.holesGrid.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const holeContainer = document.createElement('div');
        holeContainer.className = 'hole-container';
        holeContainer.dataset.index = i;
        
        const hole = document.createElement('div');
        hole.className = 'hole empty';
        hole.addEventListener('click', () => handleHoleClick(i));
        
        const mole = document.createElement('div');
        mole.className = 'mole';
        mole.innerHTML = '🐹';
        
        hole.appendChild(mole);
        holeContainer.appendChild(hole);
        elements.holesGrid.appendChild(holeContainer);
    }
}

/**
 * Set up all event listeners
 */
function initializeEventListeners() {
    elements.startButton.addEventListener('click', startGame);
    elements.soundToggle.addEventListener('click', toggleSound);
    elements.playAgainButton.addEventListener('click', handlePlayAgain);
    elements.closeModalButton.addEventListener('click', closeModal);
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
    
    // Modal click outside to close
    elements.gameOverModal.addEventListener('click', function(e) {
        if (e.target === elements.gameOverModal) {
            closeModal();
        }
    });
}

/**
 * Audio System Functions
 */

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

function playHitSound() {
    if (!isSoundEnabled) return;
    
    const context = initAudio();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.setValueAtTime(800, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, context.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
}

function playMolePopSound() {
    if (!isSoundEnabled) return;
    
    const context = initAudio();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const filter = context.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.setValueAtTime(400, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.03);
    oscillator.frequency.exponentialRampToValueAtTime(300, context.currentTime + 0.1);
    oscillator.type = 'triangle';
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, context.currentTime);
    filter.Q.setValueAtTime(3, context.currentTime);
    
    gainNode.gain.setValueAtTime(0.15, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.15);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.15);
}

function playGameOverSound() {
    if (!isSoundEnabled) return;
    
    const context = initAudio();
    
    const playGameOverNote = (frequency, startTime, duration) => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        const filter = context.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'triangle';
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(frequency * 0.8, startTime);
        filter.Q.setValueAtTime(2, startTime);
        
        gainNode.gain.setValueAtTime(0.1, startTime);
        gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    };
    
    // Classic "wah-wah-wah" descending pattern
    const gameOverNotes = [
        { freq: 440, duration: 0.4 }, // A4
        { freq: 370, duration: 0.4 }, // F#4
        { freq: 294, duration: 0.8 }, // D4
    ];
    
    let currentTime = context.currentTime;
    gameOverNotes.forEach((note) => {
        playGameOverNote(note.freq, currentTime, note.duration);
        playGameOverNote(note.freq * 1.5, currentTime, note.duration); // Add harmonic
        currentTime += note.duration + 0.1;
    });
    
    // Add final "thud" sound
    setTimeout(() => {
        if (!isSoundEnabled) return;
        const thudOsc = context.createOscillator();
        const thudGain = context.createGain();
        
        thudOsc.connect(thudGain);
        thudGain.connect(context.destination);
        
        thudOsc.frequency.setValueAtTime(80, context.currentTime);
        thudOsc.type = 'square';
        
        thudGain.gain.setValueAtTime(0.2, context.currentTime);
        thudGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
        
        thudOsc.start(context.currentTime);
        thudOsc.stop(context.currentTime + 0.3);
    }, 1000);
}

function startBackgroundMusic() {
    if (!isSoundEnabled) return;
    
    stopBackgroundMusic(); // Stop any existing music
    
    const context = initAudio();
    
    const playGameNote = (frequency, duration, startTime, instrument = 'triangle') => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        const filter = context.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = instrument;
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(frequency * 2, startTime);
        filter.Q.setValueAtTime(2, startTime);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.08, startTime + duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    };
    
    const playPercussion = (startTime) => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.setValueAtTime(80, startTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.15, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.1);
    };
    
    const gameplayMelody = [
        { freq: 659, duration: 0.2, instrument: 'triangle' }, // E5
        { freq: 784, duration: 0.2, instrument: 'triangle' }, // G5
        { freq: 880, duration: 0.2, instrument: 'triangle' }, // A5
        { freq: 784, duration: 0.2, instrument: 'triangle' }, // G5
        { freq: 659, duration: 0.4, instrument: 'triangle' }, // E5
        { freq: 523, duration: 0.2, instrument: 'triangle' }, // C5
        { freq: 659, duration: 0.4, instrument: 'triangle' }, // E5
        { freq: 587, duration: 0.2, instrument: 'triangle' }, // D5
        { freq: 659, duration: 0.2, instrument: 'triangle' }, // E5
        { freq: 784, duration: 0.2, instrument: 'triangle' }, // G5
        { freq: 880, duration: 0.4, instrument: 'triangle' }, // A5
        { freq: 784, duration: 0.4, instrument: 'triangle' }, // G5
    ];
    
    const playGameplayLoop = () => {
        if (!isSoundEnabled) return;
        
        let currentTime = context.currentTime;
        
        // Play main melody
        gameplayMelody.forEach((note, index) => {
            playGameNote(note.freq, note.duration, currentTime, note.instrument);
            if (index % 2 === 0) {
                playPercussion(currentTime);
            }
            currentTime += note.duration + 0.05;
        });
        
        // Add bass line
        const bassNotes = [262, 330, 392, 330]; // C4, E4, G4, E4
        let bassTime = context.currentTime;
        bassNotes.forEach(freq => {
            playGameNote(freq, 0.4, bassTime, 'sawtooth');
            bassTime += 0.5;
        });
    };
    
    playGameplayLoop();
    
    backgroundMusicInterval = setInterval(() => {
        if (!isSoundEnabled) {
            stopBackgroundMusic();
            return;
        }
        playGameplayLoop();
    }, 3000);
}

function stopBackgroundMusic() {
    if (backgroundMusicInterval) {
        clearInterval(backgroundMusicInterval);
        backgroundMusicInterval = null;
    }
}

function startAmbientSound() {
    if (!isSoundEnabled) return;
    
    stopAmbientSound(); // Stop any existing ambient sound
    
    const context = initAudio();
    
    const playMenuNote = (frequency, duration, startTime, instrument = 'sine') => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        const filter = context.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = instrument;
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(frequency * 1.5, startTime);
        filter.Q.setValueAtTime(1, startTime);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.04, startTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.04, startTime + duration - 0.1);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    };
    
    const playBellNote = (frequency, startTime) => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0.02, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 2);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 2);
    };
    
    const menuMelody = [
        { freq: 523, duration: 0.8 }, // C5
        { freq: 659, duration: 0.4 }, // E5
        { freq: 784, duration: 0.4 }, // G5
        { freq: 659, duration: 0.4 }, // E5
        { freq: 523, duration: 0.8 }, // C5
        { freq: 587, duration: 0.6 }, // D5
        { freq: 659, duration: 0.6 }, // E5
        { freq: 523, duration: 0.8 }, // C5
        { freq: 392, duration: 0.4 }, // G4
        { freq: 440, duration: 0.4 }, // A4
        { freq: 523, duration: 1.2 }, // C5
    ];
    
    const playMenuLoop = () => {
        if (!isSoundEnabled) return;
        
        let currentTime = context.currentTime;
        
        menuMelody.forEach((note, index) => {
            playMenuNote(note.freq, note.duration, currentTime, 'triangle');
            
            if (index % 3 === 0) {
                playBellNote(note.freq * 2, currentTime);
            }
            
            currentTime += note.duration + 0.1;
        });
        
        // Add soft bass line
        const bassTimes = [0, 2, 4, 6];
        bassTimes.forEach((time, index) => {
            const bassFreq = [131, 165, 196, 147][index]; // C3, E3, G3, D3
            playMenuNote(bassFreq, 1.5, context.currentTime + time, 'sine');
        });
    };
    
    playMenuLoop();
    
    ambientSoundInterval = setInterval(() => {
        if (!isSoundEnabled) {
            stopAmbientSound();
            return;
        }
        playMenuLoop();
    }, 8000);
}

function stopAmbientSound() {
    if (ambientSoundInterval) {
        clearInterval(ambientSoundInterval);
        ambientSoundInterval = null;
    }
}

function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    elements.soundToggle.textContent = isSoundEnabled ? '🔊' : '🔇';
    
    if (!isSoundEnabled) {
        stopBackgroundMusic();
        stopAmbientSound();
    } else if (gameState.isPlaying) {
        startBackgroundMusic();
    } else {
        startAmbientSound();
    }
}

/**
 * Game Logic Functions
 */

function clearAllTimeouts() {
    moleTimeouts.forEach(timeout => clearTimeout(timeout));
    moleTimeouts = [];
}

function hideMole(index) {
    moles[index].isVisible = false;
    const holeContainer = document.querySelector(`[data-index="${index}"]`);
    const mole = holeContainer.querySelector('.mole');
    const hole = holeContainer.querySelector('.hole');
    
    mole.classList.remove('visible');
    hole.className = 'hole empty';
}

function showMole(index) {
    moles[index] = { isVisible: true, isHit: false, showHitEffect: false };
    
    const holeContainer = document.querySelector(`[data-index="${index}"]`);
    const mole = holeContainer.querySelector('.mole');
    const hole = holeContainer.querySelector('.hole');
    
    mole.classList.add('visible');
    hole.className = 'hole mole-active';
    
    playMolePopSound();
    
    // Hide mole after random duration (800ms to 1800ms)
    const hideTime = Math.random() * 1000 + 800;
    const timeout = setTimeout(() => hideMole(index), hideTime);
    moleTimeouts.push(timeout);
}

function spawnMoles() {
    if (!gameState.isPlaying) return;
    
    const spawnRandomMole = () => {
        if (!gameState.isPlaying) return;
        
        // Hide all current moles
        for (let i = 0; i < 9; i++) {
            hideMole(i);
        }
        
        // Show random mole
        const randomHole = Math.floor(Math.random() * 9);
        showMole(randomHole);
        
        // Schedule next mole spawn (500ms to 1500ms)
        const nextSpawnTime = Math.random() * 1000 + 500;
        const timeout = setTimeout(spawnRandomMole, nextSpawnTime);
        moleTimeouts.push(timeout);
    };
    
    // Start spawning moles after 500ms
    const initialTimeout = setTimeout(spawnRandomMole, 500);
    moleTimeouts.push(initialTimeout);
}

function createHammerAnimation(holeContainer) {
    const hammerDiv = document.createElement('div');
    hammerDiv.className = 'hammer-animation';
    
    const hammerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    hammerSvg.className = 'hammer-svg';
    hammerSvg.setAttribute('width', '40');
    hammerSvg.setAttribute('height', '40');
    hammerSvg.setAttribute('viewBox', '0 0 40 40');
    
    // Hammer handle
    const handle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    handle.setAttribute('x', '16');
    handle.setAttribute('y', '8');
    handle.setAttribute('width', '8');
    handle.setAttribute('height', '24');
    handle.setAttribute('fill', '#A0522D');
    handle.setAttribute('stroke', '#654321');
    handle.setAttribute('stroke-width', '1');
    
    // Hammer head
    const head = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    head.setAttribute('x', '10');
    head.setAttribute('y', '4');
    head.setAttribute('width', '20');
    head.setAttribute('height', '12');
    head.setAttribute('fill', '#C0C0C0');
    head.setAttribute('stroke', '#808080');
    head.setAttribute('stroke-width', '1');
    head.setAttribute('rx', '2');
    
    // Hammer head highlight
    const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    highlight.setAttribute('x', '12');
    highlight.setAttribute('y', '5');
    highlight.setAttribute('width', '16');
    highlight.setAttribute('height', '10');
    highlight.setAttribute('fill', '#E0E0E0');
    highlight.setAttribute('rx', '1');
    
    hammerSvg.appendChild(handle);
    hammerSvg.appendChild(head);
    hammerSvg.appendChild(highlight);
    hammerDiv.appendChild(hammerSvg);
    
    holeContainer.appendChild(hammerDiv);
    
    setTimeout(() => {
        if (holeContainer.contains(hammerDiv)) {
            holeContainer.removeChild(hammerDiv);
        }
    }, 300);
}

function createBurstAnimation(holeContainer) {
    const burstDiv = document.createElement('div');
    burstDiv.className = 'burst-animation';
    burstDiv.textContent = '💥';
    
    holeContainer.appendChild(burstDiv);
    
    setTimeout(() => {
        if (holeContainer.contains(burstDiv)) {
            holeContainer.removeChild(burstDiv);
        }
    }, 250);
}

function createHitEffect(holeContainer) {
    const hitDiv = document.createElement('div');
    hitDiv.className = 'hit-effect';
    hitDiv.textContent = '+10';
    
    holeContainer.appendChild(hitDiv);
    
    setTimeout(() => {
        if (holeContainer.contains(hitDiv)) {
            holeContainer.removeChild(hitDiv);
        }
    }, 500);
}

function handleMoleHit(index) {
    if (!gameState.isPlaying) return;
    
    const holeContainer = document.querySelector(`[data-index="${index}"]`);
    const mole = holeContainer.querySelector('.mole');
    const hole = holeContainer.querySelector('.hole');
    
    // Create hammer and burst animations
    createHammerAnimation(holeContainer);
    createBurstAnimation(holeContainer);
    
    // Only score if there's actually a mole
    if (moles[index].isVisible) {
        playHitSound();
        
        // Hide mole and show hit effect
        mole.classList.remove('visible');
        mole.classList.add('hit');
        hole.className = 'hole hit-animation';
        
        moles[index].isVisible = false;
        moles[index].isHit = true;
        
        // Update score
        gameState.score += 10;
        updateScoreDisplay();
        
        // Show hit effect
        createHitEffect(holeContainer);
        
        // Reset mole and hole state after animation
        setTimeout(() => {
            mole.classList.remove('hit');
            hole.className = 'hole empty';
            moles[index].isHit = false;
        }, 500);
    }
}

function handleHoleClick(index) {
    handleMoleHit(index);
}

function handleKeyPress(event) {
    const key = event.key;
    const holeIndex = keyMap[key];
    
    if (holeIndex !== undefined) {
        handleMoleHit(holeIndex);
    }
}

function updateScoreDisplay() {
    elements.currentScore.textContent = gameState.score;
}

function updateTimeDisplay() {
    elements.timeLeft.textContent = gameState.timeLeft;
}

function updateHighScoreDisplay() {
    elements.highScore.textContent = gameState.highScore;
}

function endGame() {
    // Clear all intervals and timeouts
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    clearAllTimeouts();
    
    // Hide all moles
    for (let i = 0; i < 9; i++) {
        hideMole(i);
    }
    
    // Play game over sound
    playGameOverSound();
    
    // Stop background music and restart ambient sound
    stopBackgroundMusic();
    startAmbientSound();
    
    // Update game state and handle high score
    const isNewHighScore = gameState.score > gameState.highScore;
    if (isNewHighScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('whackMoleHighScore', gameState.score.toString());
        updateHighScoreDisplay();
        elements.newHighScoreMsg.style.display = 'block';
    } else {
        elements.newHighScoreMsg.style.display = 'none';
    }
    
    gameState.isPlaying = false;
    
    // Update UI
    elements.startButton.textContent = '🎮 Start Game';
    elements.startButton.disabled = false;
    elements.gameStatus.textContent = 'Click "Start Game" to begin!';
    
    // Show game over modal
    elements.finalScore.textContent = gameState.score;
    elements.gameOverModal.classList.add('show');
}

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.timeLeft = 30;
    
    // Reset moles
    moles = Array(9).fill(null).map(() => ({
        isVisible: false,
        isHit: false,
        showHitEffect: false
    }));
    
    // Hide all moles visually
    for (let i = 0; i < 9; i++) {
        hideMole(i);
    }
    
    // Update UI
    updateScoreDisplay();
    updateTimeDisplay();
    elements.startButton.textContent = '🎮 Playing...';
    elements.startButton.disabled = true;
    elements.gameStatus.textContent = 'Hit the moles!';
    
    // Stop ambient sound and start game music
    stopAmbientSound();
    startBackgroundMusic();
    
    // Start game timer
    gameInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimeDisplay();
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
    
    // Start mole spawning
    spawnMoles();
}

function handlePlayAgain() {
    closeModal();
    startGame();
}

function closeModal() {
    elements.gameOverModal.classList.remove('show');
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    clearAllTimeouts();
    stopBackgroundMusic();
    stopAmbientSound();
});