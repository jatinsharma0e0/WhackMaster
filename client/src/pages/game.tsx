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
  const [hammerAnimations, setHammerAnimations] = useState<boolean[]>(Array(9).fill(false));

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
    
    // Create cute "pop" sound for mole appearance
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.03);
    oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.1);
    oscillator.type = 'triangle';
    
    // Bright, playful filtering
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, audioContext.currentTime);
    filter.Q.setValueAtTime(3, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  }, [isSoundEnabled, initAudio]);

  const playGameOverSound = useCallback(() => {
    if (!isSoundEnabled) return;
    
    const audioContext = initAudio();
    
    // Create playful "wah-wah-wah" game over sound
    const playGameOverNote = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.type = 'triangle';
      
      // Muted, warm tone
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
    
    let currentTime = audioContext.currentTime;
    gameOverNotes.forEach((note, index) => {
      playGameOverNote(note.freq, currentTime, note.duration);
      
      // Add harmonic for richer sound
      playGameOverNote(note.freq * 1.5, currentTime, note.duration);
      
      currentTime += note.duration + 0.1;
    });
    
    // Add final "thud" sound
    setTimeout(() => {
      const thudOsc = audioContext.createOscillator();
      const thudGain = audioContext.createGain();
      
      thudOsc.connect(thudGain);
      thudGain.connect(audioContext.destination);
      
      thudOsc.frequency.setValueAtTime(80, audioContext.currentTime);
      thudOsc.type = 'square';
      
      thudGain.gain.setValueAtTime(0.2, audioContext.currentTime);
      thudGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      thudOsc.start(audioContext.currentTime);
      thudOsc.stop(audioContext.currentTime + 0.3);
    }, 1000);
  }, [isSoundEnabled, initAudio]);

  const startBackgroundMusic = useCallback(() => {
    if (!isSoundEnabled) return;
    
    const audioContext = initAudio();
    
    // Stop existing background music
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.stop();
    }
    
    // Create energetic gameplay music (120-140 BPM)
    const playGameNote = (frequency: number, duration: number, startTime: number, instrument: string = 'triangle') => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.type = instrument as OscillatorType;
      
      // Bright, crisp sound for gameplay
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
    
    // Add percussion layer
    const playPercussion = (startTime: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(80, startTime);
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.15, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.1);
    };
    
    // Energetic gameplay melody (inspired by mini-games)
    const gameplayMelody = [
      // Main theme - upbeat and rhythmic
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
      
      let currentTime = audioContext.currentTime;
      
      // Play main melody
      gameplayMelody.forEach((note, index) => {
        playGameNote(note.freq, note.duration, currentTime, note.instrument);
        // Add percussion on beats
        if (index % 2 === 0) {
          playPercussion(currentTime);
        }
        currentTime += note.duration + 0.05;
      });
      
      // Add bass line
      const bassNotes = [262, 330, 392, 330]; // C4, E4, G4, E4
      let bassTime = audioContext.currentTime;
      bassNotes.forEach(freq => {
        playGameNote(freq, 0.4, bassTime, 'sawtooth');
        bassTime += 0.5;
      });
    };
    
    // Start immediately
    playGameplayLoop();
    
    // Loop every 3 seconds
    const gameplayInterval = setInterval(() => {
      if (!isSoundEnabled) {
        clearInterval(gameplayInterval);
        return;
      }
      playGameplayLoop();
    }, 3000);
    
    // Store reference to stop later
    backgroundMusicRef.current = {
      stop: () => clearInterval(gameplayInterval)
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
    
    // Create cheerful, inviting start screen music (90-110 BPM)
    const playMenuNote = (frequency: number, duration: number, startTime: number, instrument: string = 'sine') => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.type = instrument as OscillatorType;
      
      // Warm, welcoming sound with gentle filtering
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
    
    // Add soft bell-like accompaniment
    const playBellNote = (frequency: number, startTime: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.type = 'triangle';
      
      gainNode.gain.setValueAtTime(0.02, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 2);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 2);
    };
    
    // Gentle, carnival-like melody for main menu
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
      
      let currentTime = audioContext.currentTime;
      
      // Play main melody with ukulele-like sound
      menuMelody.forEach((note, index) => {
        playMenuNote(note.freq, note.duration, currentTime, 'triangle');
        
        // Add bell accompaniment on key notes
        if (index % 3 === 0) {
          playBellNote(note.freq * 2, currentTime);
        }
        
        currentTime += note.duration + 0.1;
      });
      
      // Add soft bass line
      const bassTimes = [0, 2, 4, 6];
      bassTimes.forEach((time, index) => {
        const bassFreq = [131, 165, 196, 147][index]; // C3, E3, G3, D3
        playMenuNote(bassFreq, 1.5, audioContext.currentTime + time, 'sine');
      });
    };
    
    // Start immediately
    playMenuLoop();
    
    // Loop every 8 seconds (longer, more relaxed)
    const menuInterval = setInterval(() => {
      if (!isSoundEnabled) {
        clearInterval(menuInterval);
        return;
      }
      playMenuLoop();
    }, 8000);
    
    // Store reference to stop later
    ambientSoundRef.current = {
      stop: () => clearInterval(menuInterval)
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

  // Hammer animation functions
  const triggerHammerAnimation = useCallback((holeIndex: number) => {
    setHammerAnimations(prev => {
      const newAnimations = [...prev];
      newAnimations[holeIndex] = true;
      return newAnimations;
    });

    // Reset animation after 300ms
    setTimeout(() => {
      setHammerAnimations(prev => {
        const newAnimations = [...prev];
        newAnimations[holeIndex] = false;
        return newAnimations;
      });
    }, 300);
  }, []);

  // Numpad key mapping (1-9 to grid positions)
  const getHoleIndexFromKey = useCallback((key: string): number => {
    const keyMap: { [key: string]: number } = {
      '1': 6, '2': 7, '3': 8, // Bottom row
      '4': 3, '5': 4, '6': 5, // Middle row
      '7': 0, '8': 1, '9': 2  // Top row
    };
    return keyMap[key] ?? -1;
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
    if (!gameState.isPlaying) return;

    // Only play hit sound and update score if there's actually a mole
    if (moles[index].isVisible) {
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
    }
  }, [gameState.isPlaying, moles, playHitSound]);

  // Handle numpad key presses
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const key = event.key;
    const holeIndex = getHoleIndexFromKey(key);
    
    if (holeIndex !== -1) {
      // Trigger hammer animation
      triggerHammerAnimation(holeIndex);
      
      // Handle mole hit if there's a mole
      handleMoleHit(holeIndex);
    }
  }, [getHoleIndexFromKey, triggerHammerAnimation, handleMoleHit]);

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

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

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
        <div className="bg-game-green grass-texture rounded-3xl p-8 shadow-2xl border-4 border-yellow-600 mb-8 hammer-cursor">
          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
            {moles.map((mole, index) => (
              <div key={index} className="relative">
                <div className="hole w-24 h-24 md:w-32 md:h-32 rounded-full relative overflow-hidden transform transition-transform hover:scale-105">
                  {/* Mole Element */}
                  <div 
                    className={`mole absolute inset-0 flex items-center justify-center transition-transform duration-300 ${
                      mole.isVisible ? 'translate-y-0 active' : 'translate-y-full'
                    } ${mole.isHit ? 'hit' : ''}`}
                    onClick={() => {
                      triggerHammerAnimation(index);
                      handleMoleHit(index);
                    }}
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

                {/* Hammer Animation */}
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                  hammerAnimations[index] ? 'hammer-animation' : ''
                }`}>
                  <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 40 40" className="transform rotate-45">
                      {/* Hammer handle */}
                      <rect x="16" y="8" width="8" height="24" fill="#A0522D" stroke="#654321" strokeWidth="1"/>
                      {/* Hammer head */}
                      <rect x="10" y="4" width="20" height="12" fill="#C0C0C0" stroke="#808080" strokeWidth="1" rx="2"/>
                      {/* Hammer head highlight */}
                      <rect x="12" y="5" width="16" height="10" fill="#E0E0E0" rx="1"/>
                    </svg>
                  </div>
                </div>

                {/* Burst Effect */}
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                  hammerAnimations[index] ? 'burst-animation' : ''
                }`}>
                  <div className="text-3xl md:text-4xl">💥</div>
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
            <div className="grid md:grid-cols-2 gap-4 text-gray-700 mb-6">
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
            
            {/* Controls Section */}
            <div className="border-t-2 border-gray-200 pt-4">
              <h3 className="font-bold text-lg game-brown mb-3 text-center">Controls</h3>
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <div className="font-semibold text-gray-600 mb-2">🖱️ Mouse</div>
                  <p className="text-sm">Click on holes to whack moles</p>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-600 mb-2">⌨️ Numpad (1-9)</div>
                  <div className="grid grid-cols-3 gap-1 text-xs bg-gray-100 p-2 rounded">
                    <div className="bg-white border rounded p-1 text-center">7</div>
                    <div className="bg-white border rounded p-1 text-center">8</div>
                    <div className="bg-white border rounded p-1 text-center">9</div>
                    <div className="bg-white border rounded p-1 text-center">4</div>
                    <div className="bg-white border rounded p-1 text-center">5</div>
                    <div className="bg-white border rounded p-1 text-center">6</div>
                    <div className="bg-white border rounded p-1 text-center">1</div>
                    <div className="bg-white border rounded p-1 text-center">2</div>
                    <div className="bg-white border rounded p-1 text-center">3</div>
                  </div>
                </div>
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
