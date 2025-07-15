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

// Bomb States (9 holes, indexed 0-8)
let bombs = Array(9).fill(null).map(() => ({
    isVisible: false,
    isHit: false
}));

// Bomb Management Variables
let bombSpawnStartTime = 5000; // Start spawning bombs after 5 seconds
let bombSpawnInterval = 5000; // 5 second interval between bomb spawns
let maxBombsPerInterval = 2; // Maximum 2 bombs per interval
let bombTimeouts = [];
let currentBombCount = 0;
let bombSpawnTimer = null;

// Game Control Variables
let gameInterval = null;
let moleTimeouts = [];
let isSoundEnabled = true;
let audioFiles = {};
let backgroundMusic = null;
let ambientMusic = null;
let isKeyPressed = false;
let pressedKeys = new Set();

// Keyboard Animation Variables
let cursorHideTimeout = null;

// Dynamic Cursor Variables
let dynamicCursor = null;


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
    createDynamicCursor();
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
        
        const bomb = document.createElement('div');
        bomb.className = 'bomb';
        bomb.innerHTML = '💣';
        
        hole.appendChild(mole);
        hole.appendChild(bomb);
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
        'ambient_music.wav',
        'explosion.wav'
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

function playExplosionSound() {
    if (!isSoundEnabled || !audioFiles.explosion) return;
    
    try {
        audioFiles.explosion.currentTime = 0;
        audioFiles.explosion.volume = 0.7;
        audioFiles.explosion.play().catch(e => console.log('Explosion sound failed:', e));
    } catch (e) {
        console.log('Explosion sound error:', e);
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
    bombTimeouts.forEach(timeout => clearTimeout(timeout));
    bombTimeouts = [];
    if (bombSpawnTimer) {
        clearInterval(bombSpawnTimer);
        bombSpawnTimer = null;
    }
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

// Bomb Management Functions
function hideBomb(index) {
    bombs[index].isVisible = false;
    const holeContainer = document.querySelector(`[data-index="${index}"]`);
    const bomb = holeContainer.querySelector('.bomb');
    const hole = holeContainer.querySelector('.hole');
    
    bomb.classList.remove('visible');
    if (!moles[index].isVisible) {
        hole.className = 'hole empty';
    }
}

function showBomb(index) {
    bombs[index] = { isVisible: true, isHit: false };
    
    const holeContainer = document.querySelector(`[data-index="${index}"]`);
    const bomb = holeContainer.querySelector('.bomb');
    const hole = holeContainer.querySelector('.hole');
    
    bomb.classList.add('visible');
    hole.className = 'hole bomb-active';
    
    // Hide bomb after random duration (1500ms to 3000ms)
    const hideTime = Math.random() * 1500 + 1500;
    const timeout = setTimeout(() => hideBomb(index), hideTime);
    bombTimeouts.push(timeout);
}

function spawnBombs() {
    if (!gameState.isPlaying) return;
    
    const spawnRandomBombs = () => {
        if (!gameState.isPlaying) return;
        
        // Only spawn bombs if at least 5 seconds have passed
        if (gameState.timeLeft > 25) return;
        
        // Determine number of bombs to spawn (0-2 bombs)
        const bombsToSpawn = Math.random() < 0.7 ? 1 : (Math.random() < 0.5 ? 2 : 0);
        
        if (bombsToSpawn === 0) return;
        
        // Get available holes (not occupied by moles or bombs)
        const availableHoles = [];
        for (let i = 0; i < 9; i++) {
            if (!moles[i].isVisible && !bombs[i].isVisible) {
                availableHoles.push(i);
            }
        }
        
        // Spawn bombs in random holes
        for (let i = 0; i < bombsToSpawn && availableHoles.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableHoles.length);
            const holeIndex = availableHoles.splice(randomIndex, 1)[0];
            showBomb(holeIndex);
        }
    };
    
    // Start bomb spawning after 5 seconds, then every 5 seconds
    const initialBombTimeout = setTimeout(() => {
        spawnRandomBombs();
        bombSpawnTimer = setInterval(spawnRandomBombs, bombSpawnInterval);
    }, bombSpawnStartTime);
    
    bombTimeouts.push(initialBombTimeout);
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
    
    // Create burst animation only (dynamic cursor handles hammer animation)
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

function handleBombHit(index) {
    if (!gameState.isPlaying) return;
    
    const holeContainer = document.querySelector(`[data-index="${index}"]`);
    const bomb = holeContainer.querySelector('.bomb');
    const hole = holeContainer.querySelector('.hole');
    
    // Create explosion animation only (dynamic cursor handles hammer animation)
    createExplosionAnimation(holeContainer);
    
    // Only trigger game over if there's actually a bomb
    if (bombs[index].isVisible) {
        // Play explosion sound
        playExplosionSound();
        
        // Hide bomb and show explosion effect
        bomb.classList.remove('visible');
        bomb.classList.add('exploded');
        hole.className = 'hole explosion-animation';
        
        bombs[index].isVisible = false;
        bombs[index].isHit = true;
        
        // Trigger immediate game over
        setTimeout(() => {
            endGame();
        }, 500); // Small delay to show explosion animation
    }
}

function createExplosionAnimation(holeContainer) {
    const explosionDiv = document.createElement('div');
    explosionDiv.className = 'explosion-animation';
    explosionDiv.textContent = '💥';
    
    holeContainer.appendChild(explosionDiv);
    
    setTimeout(() => {
        if (holeContainer.contains(explosionDiv)) {
            holeContainer.removeChild(explosionDiv);
        }
    }, 500);
}

function handleHoleClick(index) {
    // Check if there's a bomb first (bombs take priority)
    if (bombs[index].isVisible) {
        handleBombHit(index);
    } else {
        handleMoleHit(index);
    }
}

/**
 * Keyboard Animation Functions
 */
function createHammerHitAnimation(holeIndex) {
    const holeContainer = document.querySelector(`[data-index="${holeIndex}"]`);
    if (!holeContainer) return;
    
    // Create hammer animation element
    const hammerDiv = document.createElement('div');
    hammerDiv.className = 'hammer-hit-animation';
    hammerDiv.style.backgroundImage = "url('assets/hammer-cursor-128.png')";
    
    holeContainer.appendChild(hammerDiv);
    
    // Create impact effect at the moment of hit
    setTimeout(() => {
        const impactDiv = document.createElement('div');
        impactDiv.className = 'hammer-impact-effect';
        impactDiv.textContent = '💥';
        holeContainer.appendChild(impactDiv);
        
        // Remove impact effect
        setTimeout(() => {
            if (holeContainer.contains(impactDiv)) {
                holeContainer.removeChild(impactDiv);
            }
        }, 200);
    }, 240); // Show impact at 60% of animation (0.4s * 0.6 = 240ms)
    
    // Remove hammer animation after completion
    setTimeout(() => {
        if (holeContainer.contains(hammerDiv)) {
            holeContainer.removeChild(hammerDiv);
        }
    }, 400);
}

function hideMouseCursor() {
    // Add class to hide cursor everywhere
    document.body.classList.add('hide-cursor');
    
    // Hide dynamic cursor
    if (dynamicCursor) {
        dynamicCursor.style.display = 'none';
    }
    
    // Clear any existing timeout
    if (cursorHideTimeout) {
        clearTimeout(cursorHideTimeout);
    }
}

function showMouseCursor() {
    // Set timeout to show cursor after 500ms
    cursorHideTimeout = setTimeout(() => {
        document.body.classList.remove('hide-cursor');
        if (dynamicCursor) {
            dynamicCursor.style.display = 'block';
        }
    }, 500);
}

/**
 * Dynamic Cursor Functions
 */
function createDynamicCursor() {
    dynamicCursor = document.createElement('div');
    dynamicCursor.className = 'dynamic-hammer-cursor';
    document.body.appendChild(dynamicCursor);
    
    // Track mouse movement
    document.addEventListener('mousemove', updateCursorPosition);
    
    // Add click animation
    document.addEventListener('mousedown', animateCursorHit);
}

function updateCursorPosition(e) {
    if (dynamicCursor) {
        dynamicCursor.style.left = e.clientX + 'px';
        dynamicCursor.style.top = e.clientY + 'px';
    }
}

function animateCursorHit() {
    if (dynamicCursor) {
        dynamicCursor.classList.add('hitting');
        setTimeout(() => {
            dynamicCursor.classList.remove('hitting');
        }, 400);
    }
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
    
    // Hide mouse cursor and show hammer animation
    hideMouseCursor();
    createHammerHitAnimation(holeIndex);
    
    // Handle the hit (check for bombs first)
    if (bombs[holeIndex].isVisible) {
        handleBombHit(holeIndex);
    } else {
        handleMoleHit(holeIndex);
    }
    
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
    
    // Show mouse cursor after delay
    showMouseCursor();
    
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
    
    // Hide all moles and bombs
    for (let i = 0; i < 9; i++) {
        hideMole(i);
        hideBomb(i);
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
    
    // Reset bombs
    bombs = Array(9).fill(null).map(() => ({
        isVisible: false,
        isHit: false
    }));
    
    // Hide all moles and bombs visually
    for (let i = 0; i < 9; i++) {
        hideMole(i);
        hideBomb(i);
    }
    
    // Update UI
    updateScoreDisplay();
    updateTimeDisplay();
    elements.startButton.textContent = '🎮 Playing...';
    elements.startButton.disabled = true;
    elements.gameStatus.textContent = 'Hit the moles! Avoid bombs 💣!';
    
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
    
    // Start bomb spawning
    spawnBombs();
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