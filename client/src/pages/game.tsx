import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface GameState {
  isPlaying: boolean;
  score: number;
  timeLeft: number;
  highScore: number;
}

interface MoleState {
  isVisible: boolean;
  isHit: boolean;
  showHitEffect: boolean;
}

export default function Game() {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    timeLeft: 30,
    highScore: parseInt(localStorage.getItem('whackMoleHighScore') || '0'),
  });

  const [moles, setMoles] = useState<MoleState[]>(
    Array(9).fill(null).map(() => ({
      isVisible: false,
      isHit: false,
      showHitEffect: false,
    }))
  );

  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const moleTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<OscillatorNode | null>(null);
  const ambientSoundRef = useRef<OscillatorNode | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const clearAllTimeouts = useCallback(() => {
    moleTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    moleTimeoutsRef.current = [];
  }, []);

  // Audio functions
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playHitSound = useCallback(() => {
    if (!isSoundEnabled) return;
    
    const audioContext = initAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, [isSoundEnabled, initAudio]);

  const playMolePopSound = useCallback(() => {
    if (!isSoundEnabled) return;
    
    const audioContext = initAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  }, [isSoundEnabled, initAudio]);

  const playGameOverSound = useCallback(() => {
    if (!isSoundEnabled) return;
    
    const audioContext = initAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, [isSoundEnabled, initAudio]);

  const startBackgroundMusic = useCallback(() => {
    if (!isSoundEnabled) return;
    
    const audioContext = initAudio();
    
    // Stop existing background music
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.stop();
    }
    
    // Create a simple melody with oscillators
    const playMelodyNote = (frequency: number, duration: number, startTime: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.type = 'triangle';
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.05, startTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0.05, startTime + duration - 0.1);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    // Simple cheerful melody
    const melody = [
      { freq: 523, duration: 0.3 }, // C5
      { freq: 587, duration: 0.3 }, // D5
      { freq: 659, duration: 0.3 }, // E5
      { freq: 523, duration: 0.3 }, // C5
      { freq: 659, duration: 0.3 }, // E5
      { freq: 523, duration: 0.3 }, // C5
      { freq: 587, duration: 0.6 }, // D5
    ];
    
    let currentTime = audioContext.currentTime;
    melody.forEach(note => {
      playMelodyNote(note.freq, note.duration, currentTime);
      currentTime += note.duration + 0.1;
    });
    
    // Repeat melody every 3 seconds
    const repeatInterval = setInterval(() => {
      if (!isSoundEnabled) {
        clearInterval(repeatInterval);
        return;
      }
      
      let currentTime = audioContext.currentTime;
      melody.forEach(note => {
        playMelodyNote(note.freq, note.duration, currentTime);
        currentTime += note.duration + 0.1;
      });
    }, 3000);
    
    // Store reference to stop later
    backgroundMusicRef.current = {
      stop: () => clearInterval(repeatInterval)
    } as any;
  }, [isSoundEnabled, initAudio]);

  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.stop();
      backgroundMusicRef.current = null;
    }
  }, []);

  const startAmbientSound = useCallback(() => {
    if (!isSoundEnabled) return;
    
    const audioContext = initAudio();
    
    // Stop existing ambient sound
    if (ambientSoundRef.current) {
      ambientSoundRef.current.stop();
    }
    
    // Create a gentle ambient sound with multiple layers
    const createAmbientLayer = (frequency: number, volume: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Add gentle filtering for a softer sound
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, audioContext.currentTime);
      filter.Q.setValueAtTime(0.5, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      
      // Add subtle frequency modulation for a more natural sound
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      
      lfo.frequency.setValueAtTime(0.1, audioContext.currentTime);
      lfo.type = 'sine';
      lfoGain.gain.setValueAtTime(10, audioContext.currentTime);
      
      oscillator.start(audioContext.currentTime);
      lfo.start(audioContext.currentTime);
      
      return { oscillator, lfo };
    };
    
    // Create multiple layers for a rich ambient sound
    const layer1 = createAmbientLayer(220, 0.02); // Deep bass
    const layer2 = createAmbientLayer(440, 0.015); // Mid tone
    const layer3 = createAmbientLayer(880, 0.01); // High tone
    
    // Store reference to stop later
    ambientSoundRef.current = {
      stop: () => {
        layer1.oscillator.stop();
        layer1.lfo.stop();
        layer2.oscillator.stop();
        layer2.lfo.stop();
        layer3.oscillator.stop();
        layer3.lfo.stop();
      }
    } as any;
  }, [isSoundEnabled, initAudio]);

  const stopAmbientSound = useCallback(() => {
    if (ambientSoundRef.current) {
      ambientSoundRef.current.stop();
      ambientSoundRef.current = null;
    }
  }, []);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev);
  }, []);

  const hideMole = useCallback((index: number) => {
    setMoles(prev => prev.map((mole, i) => 
      i === index ? { ...mole, isVisible: false } : mole
    ));
  }, []);

  const showMole = useCallback((index: number) => {
    setMoles(prev => prev.map((mole, i) => 
      i === index ? { ...mole, isVisible: true, isHit: false } : mole
    ));

    // Play mole pop sound
    playMolePopSound();

    // Hide mole after random duration (800ms to 1800ms)
    const hideTime = Math.random() * 1000 + 800;
    const timeout = setTimeout(() => hideMole(index), hideTime);
    moleTimeoutsRef.current.push(timeout);
  }, [hideMole, playMolePopSound]);

  const spawnMoles = useCallback(() => {
    if (!gameState.isPlaying) return;

    const spawnRandomMole = () => {
      if (!gameState.isPlaying) return;

      // Hide all current moles
      setMoles(prev => prev.map(mole => ({ ...mole, isVisible: false })));

      // Show random mole
      const randomHole = Math.floor(Math.random() * 9);
      showMole(randomHole);

      // Schedule next mole spawn (500ms to 1500ms)
      const nextSpawnTime = Math.random() * 1000 + 500;
      const timeout = setTimeout(spawnRandomMole, nextSpawnTime);
      moleTimeoutsRef.current.push(timeout);
    };

    // Start spawning moles after 500ms
    const initialTimeout = setTimeout(spawnRandomMole, 500);
    moleTimeoutsRef.current.push(initialTimeout);
  }, [gameState.isPlaying, showMole]);

  const handleMoleHit = useCallback((index: number) => {
    if (!gameState.isPlaying || !moles[index].isVisible) return;

    // Play hit sound
    playHitSound();

    // Hide mole immediately and show hit effect
    setMoles(prev => prev.map((mole, i) => 
      i === index 
        ? { ...mole, isVisible: false, isHit: true, showHitEffect: true }
        : mole
    ));

    // Update score
    setGameState(prev => ({ ...prev, score: prev.score + 10 }));

    // Hide hit effect after 500ms
    setTimeout(() => {
      setMoles(prev => prev.map((mole, i) => 
        i === index 
          ? { ...mole, isHit: false, showHitEffect: false }
          : mole
      ));
    }, 500);
  }, [gameState.isPlaying, moles, playHitSound]);

  const endGame = useCallback(() => {
    // Clear all intervals and timeouts first
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
    clearAllTimeouts();

    // Hide all moles
    setMoles(prev => prev.map(mole => ({ ...mole, isVisible: false })));

    // Play game over sound
    playGameOverSound();

    // Stop background music and restart ambient sound
    stopBackgroundMusic();
    startAmbientSound();

    // Update game state and handle high score
    setGameState(prev => {
      const newHighScore = prev.score > prev.highScore;
      if (newHighScore) {
        localStorage.setItem('whackMoleHighScore', prev.score.toString());
        setIsNewHighScore(true);
        return { ...prev, isPlaying: false, highScore: prev.score };
      } else {
        setIsNewHighScore(false);
        return { ...prev, isPlaying: false };
      }
    });

    setShowGameOverModal(true);
  }, [clearAllTimeouts]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      score: 0,
      timeLeft: 30,
    }));

    // Stop ambient sound and start game music
    stopAmbientSound();
    startBackgroundMusic();

    // Start game timer
    gameIntervalRef.current = setInterval(() => {
      setGameState(prev => {
        const newTimeLeft = prev.timeLeft - 1;
        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);
  }, [startBackgroundMusic, stopAmbientSound]);

  const handlePlayAgain = useCallback(() => {
    setShowGameOverModal(false);
    startGame();
  }, [startGame]);

  const handleCloseModal = useCallback(() => {
    setShowGameOverModal(false);
  }, []);

  // Effect to handle game end when time runs out
  useEffect(() => {
    if (gameState.isPlaying && gameState.timeLeft <= 0) {
      endGame();
    }
  }, [gameState.isPlaying, gameState.timeLeft, endGame]);

  // Effect to start mole spawning when game starts
  useEffect(() => {
    if (gameState.isPlaying) {
      spawnMoles();
    }
  }, [gameState.isPlaying, spawnMoles]);

  // Effect to handle sound toggle
  useEffect(() => {
    if (!isSoundEnabled) {
      stopBackgroundMusic();
      stopAmbientSound();
    } else if (gameState.isPlaying) {
      startBackgroundMusic();
    } else {
      startAmbientSound();
    }
  }, [isSoundEnabled, gameState.isPlaying, startBackgroundMusic, stopBackgroundMusic, startAmbientSound, stopAmbientSound]);

  // Start ambient sound on mount
  useEffect(() => {
    if (!gameState.isPlaying) {
      startAmbientSound();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
      clearAllTimeouts();
      stopBackgroundMusic();
      stopAmbientSound();
    };
  }, [clearAllTimeouts, stopBackgroundMusic, stopAmbientSound]);

  return (
    <div className="bg-game-bg min-h-screen font-sans">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Game Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="text-4xl md:text-6xl font-bold game-brown animate-bounce-in">
              🔨 Whack-a-Mole! 🔨
            </h1>
            <Button
              onClick={toggleSound}
              variant="outline"
              className="bg-white hover:bg-gray-100 border-2 border-gray-300 p-2 rounded-full"
            >
              {isSoundEnabled ? '🔊' : '🔇'}
            </Button>
          </div>
          <p className="text-gray-600 text-lg md:text-xl">Hit the moles as they pop up!</p>
        </div>

        {/* Game Stats */}
        <div className="flex justify-center gap-8 mb-8">
          <Card className="min-w-[120px] border-4 border-yellow-500">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="game-amber text-sm font-semibold mb-1">SCORE</div>
                <div className="font-bold text-3xl game-brown">{gameState.score}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-[120px] border-4 border-red-500">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="game-red text-sm font-semibold mb-1">TIME</div>
                <div className="font-bold text-3xl game-brown">{gameState.timeLeft}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Board */}
        <div className="bg-game-green grass-texture rounded-3xl p-8 shadow-2xl border-4 border-yellow-600 mb-8">
          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
            {moles.map((mole, index) => (
              <div key={index} className="relative">
                <div className="hole w-24 h-24 md:w-32 md:h-32 rounded-full relative overflow-hidden cursor-pointer transform transition-transform hover:scale-105">
                  {/* Mole Element */}
                  <div 
                    className={`mole absolute inset-0 flex items-center justify-center transition-transform duration-300 ${
                      mole.isVisible ? 'translate-y-0 active' : 'translate-y-full'
                    } ${mole.isHit ? 'hit' : ''}`}
                    onClick={() => handleMoleHit(index)}
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-game-brown rounded-full border-4 border-yellow-600 flex items-center justify-center shadow-lg">
                      <div className="text-2xl md:text-3xl">🐹</div>
                    </div>
                  </div>
                </div>
                
                {/* Hit Effect */}
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 ${
                  mole.showHitEffect ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}>
                  <div className="bg-game-red text-white font-bold text-xl rounded-full px-3 py-1 shadow-lg">
                    +10
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Controls */}
        <div className="text-center mb-8">
          <Button
            onClick={startGame}
            disabled={gameState.isPlaying}
            className="bg-game-amber hover:bg-yellow-500 text-white font-bold text-xl px-8 py-4 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 border-4 border-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gameState.isPlaying ? '🎮 Playing...' : '🎮 Start Game'}
          </Button>
          <div className="mt-4 text-lg font-semibold game-brown">
            {gameState.isPlaying ? 'Hit the moles!' : 'Click "Start Game" to begin!'}
          </div>
        </div>

        {/* Game Instructions */}
        <Card className="border-4 border-green-500 mb-8">
          <CardContent className="p-6">
            <h2 className="font-bold text-2xl game-brown mb-4 text-center">How to Play</h2>
            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-game-amber rounded-full flex items-center justify-center font-bold text-white">1</div>
                <span>Click "Start Game" to begin</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-game-amber rounded-full flex items-center justify-center font-bold text-white">2</div>
                <span>Hit moles as they pop up from holes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-game-amber rounded-full flex items-center justify-center font-bold text-white">3</div>
                <span>Each hit scores 10 points</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-game-amber rounded-full flex items-center justify-center font-bold text-white">4</div>
                <span>Get the highest score in 30 seconds!</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High Score Display */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold text-lg px-6 py-3 rounded-2xl shadow-lg inline-block border-4 border-yellow-600">
            🏆 High Score: {gameState.highScore}
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {showGameOverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4 border-4 border-yellow-600 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="font-bold text-3xl game-brown mb-4">Game Over!</h2>
              <div className="text-xl text-gray-600 mb-6">
                Final Score: <span className="font-bold game-amber">{gameState.score}</span>
              </div>
              {isNewHighScore && (
                <div className="game-red font-bold text-lg mb-4">
                  🏆 New High Score! 🏆
                </div>
              )}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handlePlayAgain}
                  className="bg-game-amber hover:bg-yellow-500 text-white font-bold text-xl px-6 py-3 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 border-4 border-yellow-600"
                >
                  Play Again
                </Button>
                <Button
                  onClick={handleCloseModal}
                  variant="outline"
                  className="bg-white hover:bg-gray-100 text-gray-700 font-bold text-xl px-6 py-3 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 border-4 border-gray-300"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
