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
let audioFiles = {};
let backgroundMusic = null;
let ambientMusic = null;
let isKeyPressed = false;
let pressedKeys = new Set();

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
    loadAudioFiles();
    updateHighScoreDisplay();
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
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Modal click outside to close
    elements.gameOverModal.addEventListener('click', function(e) {
        if (e.target === elements.gameOverModal) {
            closeModal();
        }
    });
    
    // Prevent context menu on right-click in game area
    elements.gameBoard.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Prevent drag start on all game elements
    elements.gameBoard.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Add visual feedback for clicks during game
    document.addEventListener('mousedown', function(e) {
        if (gameState.isPlaying) {
            // Trigger cursor animation by temporarily adding a class
            elements.gameBoard.classList.add('hammer-strike');
            
            // Also add to hole if clicking on a hole
            if (e.target.classList.contains('hole') || e.target.closest('.hole')) {
                const hole = e.target.classList.contains('hole') ? e.target : e.target.closest('.hole');
                hole.classList.add('hammer-strike');
            }
        }
    });
    
    document.addEventListener('mouseup', function(e) {
        if (gameState.isPlaying) {
            // Remove cursor animation
            elements.gameBoard.classList.remove('hammer-strike');
            
            // Also remove from all holes
            document.querySelectorAll('.hole').forEach(hole => {
                hole.classList.remove('hammer-strike');
            });
        }
    });
}

/**
 * Audio System Functions
 */

function loadAudioFiles() {
    const soundFiles = [
        'hit.wav',
        'mole_pop.wav', 
        'game_over.wav',
        'background_music.wav',
        'ambient_music.wav'
    ];
    
    soundFiles.forEach(filename => {
        const audio = new Audio(`assets/sounds/${filename}`);
        audio.preload = 'auto';
        audioFiles[filename.replace('.wav', '')] = audio;
    });
    
    // Start ambient music after loading
    setTimeout(() => {
        startAmbientSound();
    }, 500);
}

function playHitSound() {
    if (!isSoundEnabled || !audioFiles.hit) return;
    
    try {
        audioFiles.hit.currentTime = 0;
        audioFiles.hit.volume = 0.6;
        audioFiles.hit.play().catch(e => console.log('Hit sound failed:', e));
    } catch (e) {
        console.log('Hit sound error:', e);
    }
}

function playMolePopSound() {
    if (!isSoundEnabled || !audioFiles.mole_pop) return;
    
    try {
        audioFiles.mole_pop.currentTime = 0;
        audioFiles.mole_pop.volume = 0.4;
        audioFiles.mole_pop.play().catch(e => console.log('Mole pop sound failed:', e));
    } catch (e) {
        console.log('Mole pop sound error:', e);
    }
}

function playGameOverSound() {
    if (!isSoundEnabled || !audioFiles.game_over) return;
    
    try {
        audioFiles.game_over.currentTime = 0;
        audioFiles.game_over.volume = 0.5;
        audioFiles.game_over.play().catch(e => console.log('Game over sound failed:', e));
    } catch (e) {
        console.log('Game over sound error:', e);
    }
}

function startBackgroundMusic() {
    if (!isSoundEnabled || !audioFiles.background_music) return;
    
    stopBackgroundMusic(); // Stop any existing music
    
    try {
        backgroundMusic = audioFiles.background_music;
        backgroundMusic.currentTime = 0;
        backgroundMusic.volume = 0.3;
        backgroundMusic.loop = true;
        backgroundMusic.play().catch(e => console.log('Background music failed:', e));
    } catch (e) {
        console.log('Background music error:', e);
    }
}

function stopBackgroundMusic() {
    if (backgroundMusic) {
        try {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        } catch (e) {
            console.log('Stop background music error:', e);
        }
    }
}

function startAmbientSound() {
    if (!isSoundEnabled || !audioFiles.ambient_music) return;
    
    stopAmbientSound(); // Stop any existing ambient sound
    
    try {
        ambientMusic = audioFiles.ambient_music;
        ambientMusic.currentTime = 0;
        ambientMusic.volume = 0.2;
        ambientMusic.loop = true;
        ambientMusic.play().catch(e => console.log('Ambient music failed:', e));
    } catch (e) {
        console.log('Ambient music error:', e);
    }
}

function stopAmbientSound() {
    if (ambientMusic) {
        try {
            ambientMusic.pause();
            ambientMusic.currentTime = 0;
        } catch (e) {
            console.log('Stop ambient music error:', e);
        }
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
    
    const spawnRandomMoles = () => {
        if (!gameState.isPlaying) return;
        
        // Hide all current moles
        for (let i = 0; i < 9; i++) {
            hideMole(i);
        }
        
        // Determine number of moles to spawn based on time remaining
        let molesToSpawn = 1;
        if (gameState.timeLeft > 20) {
            // First 10 seconds (30-21): 1 mole
            molesToSpawn = 1;
        } else if (gameState.timeLeft > 10) {
            // Middle 10 seconds (20-11): 2 moles
            molesToSpawn = 2;
        } else {
            // Last 10 seconds (10-1): 3-4 moles
            molesToSpawn = Math.random() < 0.5 ? 3 : 4;
        }
        
        // Get available holes and spawn moles
        const availableHoles = Array.from({length: 9}, (_, i) => i);
        const selectedHoles = [];
        
        for (let i = 0; i < molesToSpawn; i++) {
            if (availableHoles.length === 0) break;
            
            const randomIndex = Math.floor(Math.random() * availableHoles.length);
            const holeIndex = availableHoles.splice(randomIndex, 1)[0];
            selectedHoles.push(holeIndex);
            showMole(holeIndex);
        }
        
        // Schedule next mole spawn - faster spawning as time progresses
        let nextSpawnTime;
        if (gameState.timeLeft > 20) {
            nextSpawnTime = Math.random() * 1000 + 1000; // 1-2 seconds
        } else if (gameState.timeLeft > 10) {
            nextSpawnTime = Math.random() * 800 + 700; // 0.7-1.5 seconds
        } else {
            nextSpawnTime = Math.random() * 600 + 400; // 0.4-1 second
        }
        
        const timeout = setTimeout(spawnRandomMoles, nextSpawnTime);
        moleTimeouts.push(timeout);
    };
    
    // Start spawning moles after 500ms
    const initialTimeout = setTimeout(spawnRandomMoles, 500);
    moleTimeouts.push(initialTimeout);
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
    
    // Create burst animation only (cursor handles hammer animation)
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

function handleKeyDown(event) {
    const key = event.key;
    const holeIndex = keyMap[key];
    
    // Only process numpad keys for the game
    if (holeIndex === undefined) return;
    
    // Prevent multiple keys being pressed simultaneously
    if (pressedKeys.size > 0) {
        event.preventDefault();
        return;
    }
    
    // Prevent key repeat
    if (pressedKeys.has(key)) {
        event.preventDefault();
        return;
    }
    
    // Add key to pressed keys set
    pressedKeys.add(key);
    
    // Handle the hit
    handleMoleHit(holeIndex);
    
    // Prevent default to avoid browser behavior
    event.preventDefault();
}

function handleKeyUp(event) {
    const key = event.key;
    const holeIndex = keyMap[key];
    
    // Only process numpad keys for the game
    if (holeIndex === undefined) return;
    
    // Remove key from pressed keys set
    pressedKeys.delete(key);
    
    // Prevent default to avoid browser behavior
    event.preventDefault();
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
    
    // Clear any pressed keys
    pressedKeys.clear();
    
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
    
    // Clear any pressed keys
    pressedKeys.clear();
    
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