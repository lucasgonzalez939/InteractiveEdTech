import { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/game-layout';
import { useGameState } from '@/hooks/use-game-state';
import { generateRandomLetter, generateRandomWord, playSound } from '@/lib/game-utils';

interface FallingItem {
  id: string;
  character: string;
  x: number;
  y: number;
  speed: number;
  isWord: boolean;
}

// Game speed constants
// This is now the BASE initial speed. It will be adjusted by difficulty.
const BASE_INITIAL_SPEED = 10.0; // Time in seconds to cross screen (higher = slower initial fall speed)
const SPEED_INCREASE_RATE = 0.25; // How much faster every 5 correct inputs
const CORRECT_INPUTS_THRESHOLD = 5; // Increase speed every 5 correct inputs

// Constants for item generation frequency
const BASE_SPAWN_PROBABILITY = 0.005; // Reduced from 0.015 for more delay
const SPAWN_PROBABILITY_MULTIPLIER = 0.00005; // Reduced slightly for less aggressive ramp-up

export default function LetterRain() {
  const { gameState, updateScore, updateHealth, updateLevel, settings } = useGameState();
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);
  const [correctInputs, setCorrectInputs] = useState(0);
  const [totalFallen, setTotalFallen] = useState(0);
  const [gameTimer, setGameTimer] = useState(180);
  const [gameSpeed, setGameSpeed] = useState(BASE_INITIAL_SPEED); // Initialized with base, will be set in useEffect

  // --- NEW LOGIC FOR ADJUSTED INITIAL SPEED BASED ON DIFFICULTY ---
  const calculateAdjustedInitialSpeed = useCallback(() => {
    let adjustedSpeed = BASE_INITIAL_SPEED;
    // Ensure settings.difficulty exists and is a string
    const difficulty = typeof settings.difficulty === 'string' ? settings.difficulty.toLowerCase() : 'normal';

    switch (difficulty) {
      case 'easy':
        // Make it 1/3 slower (more time to cross the screen)
        adjustedSpeed = BASE_INITIAL_SPEED * (1 + 1 / 3);
        break;
      case 'hard':
        // Make it 1/3 faster (less time to cross the screen)
        adjustedSpeed = BASE_INITIAL_SPEED * (1 - 1 / 3);
        // Ensure it doesn't go too low if BASE_INITIAL_SPEED is small
        adjustedSpeed = Math.max(50.0, adjustedSpeed); 
        break;
      case 'medium':
      default:
        // Use the base speed
        adjustedSpeed = BASE_INITIAL_SPEED;
        break;
    }
    return adjustedSpeed;
  }, [settings.difficulty]); // Recalculate if difficulty changes

  // Initialize gameSpeed when component mounts or difficulty changes
  useEffect(() => {
    setGameSpeed(calculateAdjustedInitialSpeed());
  }, [calculateAdjustedInitialSpeed]);
  // --- END NEW LOGIC ---

  const createFallingItem = useCallback((): FallingItem => {
    const isWord = gameState.level > 2 && Math.random() > 2.0; // Adjust word frequency if needed
    const character = isWord ? generateRandomWord() : generateRandomLetter();

    const calculatedSpeed = window.innerHeight / gameSpeed / 60; // Pixels per frame

    return {
      id: Math.random().toString(36).substr(2, 9),
      character,
      x: Math.random() * (window.innerWidth - 100),
      y: -50,
      speed: calculatedSpeed,
      isWord
    };
  }, [gameState.level, gameSpeed]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!gameStarted || gameOver) return;

    const pressedKey = event.key.toUpperCase();

    setFallingItems(prev => {
      const newItems = [...prev];
      let hitIndex = -1;

      for (let i = 0; i < newItems.length; i++) {
        const item = newItems[i];
        if (item.isWord) {
          if (item.character === pressedKey) { 
            hitIndex = i;
            break;
          }
        } else {
          if (item.character === pressedKey) {
            hitIndex = i;
            break;
          }
        }
      }

      if (hitIndex !== -1) {
        const hitItem = newItems[hitIndex];

        if (settings.animationsEnabled) {
          const sparkleParticles = Array.from({ length: 5 }, (_, i) => ({
            id: Math.random().toString(36).substr(2, 9),
            x: hitItem.x + 25,
            y: hitItem.y + 25,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1,
            color: '#FFD700'
          }));
          setParticles(prev => [...prev, ...sparkleParticles]);
        }

        if (settings.soundEnabled) {
          playSound(800, 0.1);
        }

        const points = hitItem.isWord ? 20 : 10;
        updateScore(points);
        setCorrectInputs(prev => prev + 1);

        newItems.splice(hitIndex, 1);
      }

      return newItems;
    });
  }, [gameStarted, gameOver, updateScore, settings]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      setFallingItems(prev => {
        const newItems = prev.map(item => ({
          ...item,
          y: item.y + item.speed
        }));

        const itemsOnGround = newItems.filter(item => item.y > window.innerHeight - 100);
        if (itemsOnGround.length > 0) {
          updateHealth(-1);
          setTotalFallen(prev => prev + itemsOnGround.length);
          if (settings.soundEnabled) {
            playSound(200, 0.3);
          }
        }

        return newItems.filter(item => item.y <= window.innerHeight - 100);
      });

      const currentSpawnProbability = BASE_SPAWN_PROBABILITY + (BASE_INITIAL_SPEED - gameSpeed) * SPAWN_PROBABILITY_MULTIPLIER;

      if (Math.random() < currentSpawnProbability) {
        setFallingItems(prev => [...prev, createFallingItem()]);
      }
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, gameSpeed, createFallingItem, updateHealth, settings]);

  // Particle animation
  useEffect(() => {
    if (!settings.animationsEnabled) return;

    const particleLoop = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 0.02
      })).filter(particle => particle.life > 0));
    }, 16);

    return () => clearInterval(particleLoop);
  }, [settings.animationsEnabled]);

  // Keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Game timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setGameTimer(prev => {
        if (prev <= 1) {
          setGameOver(true);
          setGameStarted(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  // Check game over conditions
  useEffect(() => {
    if (gameState.health <= 0 || totalFallen >= 100 || gameTimer <= 0) {
      setGameOver(true);
      setGameStarted(false);
    }
  }, [gameState.health, totalFallen, gameTimer]);

  // Speed increase logic - every 5 correct inputs, decrease time by SPEED_INCREASE_RATE seconds
  useEffect(() => {
    const speedIncrease = Math.floor(correctInputs / CORRECT_INPUTS_THRESHOLD);
    // Use BASE_INITIAL_SPEED for the calculation of how much speed has increased relative to base.
    // Ensure newSpeed doesn't go below a reasonable minimum (e.g., 50 seconds to cross the screen)
    const newSpeed = Math.max(50.0, calculateAdjustedInitialSpeed() - speedIncrease * SPEED_INCREASE_RATE);
    setGameSpeed(newSpeed);
  }, [correctInputs, calculateAdjustedInitialSpeed]); // Dependency added for calculateAdjustedInitialSpeed

  // Level up
  useEffect(() => {
    if (gameState.score > 0 && gameState.score % 100 === 0) {
      updateLevel();
    }
  }, [gameState.score, updateLevel]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setFallingItems([]);
    setParticles([]);
    setCorrectInputs(0);
    setTotalFallen(0);
    setGameTimer(120);
    setGameSpeed(calculateAdjustedInitialSpeed()); // Use the difficulty-adjusted initial speed
    updateHealth(100);
    updateScore(0);
    updateLevel(1);
  };

  const restartGame = () => {
    startGame();
  };

  return (
    <GameLayout
      gameTitle="Lluvia de Letras"
      gameType="letterRain"
      className="bg-gradient-to-b from-indigo-400 to-purple-600 relative overflow-hidden"
    >
      <div className="relative w-full h-screen">
        {/* Falling Items */}
        {fallingItems.map(item => (
          <div
            key={item.id}
            className="absolute text-4xl font-bold text-white bg-black/20 px-4 py-2 rounded-lg shadow-lg"
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
            }}
          >
            {item.character}
          </div>
        ))}

        {/* Particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full animate-sparkle"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              backgroundColor: particle.color,
              opacity: particle.life
            }}
          />
        ))}

        {/* Game Controls */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl p-8 text-center">
              <h2 className="text-3xl font-fredoka text-dark mb-4">¡Lluvia de Letras!</h2>
              <p className="text-gray-600 mb-6">
                Presiona las teclas correspondientes antes de que las letras toquen el suelo
              </p>
              <button
                onClick={startGame}
                className="bg-coral hover:bg-coral/80 text-white px-8 py-3 rounded-full font-bold text-xl transition-all duration-300 hover:scale-105"
              >
                Comenzar
              </button>
            </div>
          </div>
        )}

        {/* Game Over */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl p-8 text-center">
              <h2 className="text-3xl font-fredoka text-dark mb-4">¡Juego Terminado!</h2>
              <p className="text-gray-600 mb-4">Puntuación: {gameState.score}</p>
              <p className="text-gray-600 mb-6">Nivel alcanzado: {gameState.level}</p>
              <button
                onClick={restartGame}
                className="bg-coral hover:bg-coral/80 text-white px-8 py-3 rounded-full font-bold text-xl transition-all duration-300 hover:scale-105"
              >
                Jugar de Nuevo
              </button>
            </div>
          </div>
        )}

        {/* Game Stats */}
        <div className="absolute top-20 left-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-center">
            <div className="text-lg font-bold text-dark">Tiempo: {gameTimer}s</div>
            <div className="text-sm text-gray-600">Correctas: {correctInputs}</div>
            <div className="text-sm text-gray-600">Caídas: {totalFallen}/100</div>
            {/* Display the current effective speed */}
            <div className="text-sm text-gray-600">Velocidad: {gameSpeed.toFixed(1)}s</div>
            <div className="text-sm text-gray-600">Dificultad: {typeof settings.difficulty === 'string' ? settings.difficulty : 'normal'}</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center">
          <p className="text-dark font-bold">
            Presiona las teclas correspondientes antes de que las letras toquen el suelo
          </p>
          <div className="mt-2 flex justify-center space-x-2">
            <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">A</kbd>
            <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">S</kbd>
            <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">D</kbd>
            <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">F</kbd>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}