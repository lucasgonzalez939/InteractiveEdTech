import { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/game-layout';
import { useGameState } from '@/hooks/use-game-state';
import { generateRandomLetter, playSound } from '@/lib/game-utils';

interface Ball {
  id: string; // Unique ID for React keys
  x: number;
  y: number;
  vx: number; // Horizontal velocity (for side bouncing)
  vy: number; // Vertical velocity (falling speed)
  isBlockedAndBouncing?: boolean; // To track if it just hit a closed block for bounce animation
  removedAt?: number; // Timestamp for when ball should be removed after bounce
}

interface KeyBlock {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isOpen: boolean; // True means open (transparent), False means closed (visible barrier)
  row: number;
}

// --- GAME CONSTANTS ---
const INITIAL_BALL_SPEED = 0.5; // Start with a very slow ball speed (pixels per frame)
const BALL_SPEED_INCREASE_PER_LEVEL = 0.1; // How much ball speed increases per level
const INITIAL_BALL_SPAWN_INTERVAL = 2000; // Milliseconds between new ball spawns (slower at start)
const MIN_BALL_SPAWN_INTERVAL = 400; // Fastest spawn interval
const SPAWN_INTERVAL_DECREASE_RATE = 100; // How much spawn interval decreases per level

const BALL_SIZE = 32; // Balls are 32x32 pixels
const BLOCK_WIDTH = 60;
const BLOCK_HEIGHT = 50;
const HORIZONTAL_SPACING = 20; // Increased horizontal space between keys
const VERTICAL_ROW_SPACING = 80; // Increased vertical space between rows (makes rows apart)

const BOUNCE_ANIMATION_DURATION = 250; // ms for bounce visual effect before removal

export default function KeyBarrier() {
  const { gameState, updateScore, updateHealth, updateLevel, settings } = useGameState();
  const [balls, setBalls] = useState<Ball[]>([]);
  const [keyBlocks, setKeyBlocks] = useState<KeyBlock[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [ballsPassed, setBallsPassed] = useState(0); // Renamed from ballsReachedBottom
  const [ballsBlocked, setBallsBlocked] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // <-- NEW STATE: to count seconds survived

  // Dynamic game state based on level/score
  const [currentBallSpeed, setCurrentBallSpeed] = useState(INITIAL_BALL_SPEED);
  const [currentSpawnInterval, setCurrentSpawnInterval] = useState(INITIAL_BALL_SPAWN_INTERVAL);

  // Define keyboard layout
  const keyboardRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  // Calculate the widest row's pixel width to constrain balls
  const widestRowLength = Math.max(...keyboardRows.map(row => row.length));
  const playAreaWidth = widestRowLength * BLOCK_WIDTH + (widestRowLength - 1) * HORIZONTAL_SPACING;
  const playAreaStartX = (window.innerWidth - playAreaWidth) / 2;
  const playAreaEndX = playAreaStartX + playAreaWidth;

  const generateKeyBlocks = useCallback((): KeyBlock[] => {
    const blocks: KeyBlock[] = [];
    const totalRowsHeight = BLOCK_HEIGHT * keyboardRows.length + VERTICAL_ROW_SPACING * (keyboardRows.length - 1);
    const startY = window.innerHeight - totalRowsHeight - 100; // Place rows higher up

    keyboardRows.forEach((row, rowIndex) => {
      const rowWidth = row.length * BLOCK_WIDTH + (row.length - 1) * HORIZONTAL_SPACING;
      const startX = (window.innerWidth - rowWidth) / 2;

      row.forEach((key, keyIndex) => {
        blocks.push({
          key,
          x: startX + keyIndex * (BLOCK_WIDTH + HORIZONTAL_SPACING),
          y: startY + rowIndex * (BLOCK_HEIGHT + VERTICAL_ROW_SPACING),
          isOpen: true, // Blocks start OPEN (transparent until pressed)
          width: BLOCK_WIDTH,
          height: BLOCK_HEIGHT,
          row: rowIndex
        });
      });
    });
    return blocks;
  }, []);

  const initializeGame = useCallback(() => {
    setBalls([]);
    setKeyBlocks(generateKeyBlocks());
    setGameOver(false);
    setPressedKeys(new Set());
    setBallsPassed(0);
    setBallsBlocked(0);
    setElapsedTime(0); // <-- RESET TIMER HERE
    setCurrentBallSpeed(INITIAL_BALL_SPEED);
    setCurrentSpawnInterval(INITIAL_BALL_SPAWN_INTERVAL);
    updateHealth(100); // Reset player health
    updateScore(0);    // Reset score
    updateLevel(1);    // Reset level
  }, [generateKeyBlocks, updateHealth, updateScore, updateLevel]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!gameStarted || gameOver) return;

    const pressedKey = event.key.toUpperCase();
    if (event.repeat || pressedKeys.has(pressedKey)) return; 

    setPressedKeys(prev => new Set([...prev, pressedKey]));

    setKeyBlocks(prev => prev.map(block => {
      if (block.key === pressedKey) {
        if (settings.soundEnabled) {
          playSound(400, 0.2); // Sound for closing block
        }
        return { ...block, isOpen: false }; // Pressing key CLOSES the block (makes it visible)
      }
      return block;
    }));
  }, [gameStarted, gameOver, pressedKeys, settings]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!gameStarted || gameOver) return;

    const releasedKey = event.key.toUpperCase();
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(releasedKey);
      return newSet;
    });

    setKeyBlocks(prev => prev.map(block => {
      if (block.key === releasedKey) {
        return { ...block, isOpen: true }; // Releasing key OPENS the block (makes it transparent)
      }
      return block;
    }));
  }, [gameStarted, gameOver]);

  const checkCollision = useCallback((ball: Ball, block: KeyBlock): boolean => {
    return ball.x < block.x + block.width &&
           ball.x + BALL_SIZE > block.x &&
           ball.y < block.y + block.height &&
           ball.y + BALL_SIZE > block.y;
  }, []);

  const createBall = useCallback((): Ball => {
    const spawnX = playAreaStartX + Math.random() * (playAreaWidth - BALL_SIZE);

    return {
      id: Math.random().toString(36).substr(2, 9),
      x: spawnX,
      y: -BALL_SIZE,
      vx: (Math.random() - 0.5) * 2, // Small random horizontal velocity
      vy: currentBallSpeed, // Use dynamic vertical speed
    };
  }, [currentBallSpeed, playAreaStartX, playAreaWidth]);


  // --- useEffect for Ball Spawn Timer ---
  useEffect(() => {
    let ballSpawnTimer: NodeJS.Timeout;
    if (gameStarted && !gameOver) {
      ballSpawnTimer = setInterval(() => {
        setBalls(prev => [...prev, createBall()]);
      }, currentSpawnInterval);
    }

    return () => {
      clearInterval(ballSpawnTimer);
    };
  }, [gameStarted, gameOver, currentSpawnInterval, createBall]);


  // --- useEffect for Game Physics Loop ---
  useEffect(() => {
    let gamePhysicsLoop: NodeJS.Timeout;
    if (gameStarted && !gameOver) {
      gamePhysicsLoop = setInterval(() => {
        setBalls(prevBalls => {
          const newBalls: Ball[] = [];
          prevBalls.forEach(ball => {
            // If ball is already bouncing and its removal time has passed, skip it
            if (ball.isBlockedAndBouncing && ball.removedAt && Date.now() >= ball.removedAt) {
              return; // Ball is effectively removed
            }

            const updatedBall = {
              ...ball,
              x: ball.x + ball.vx,
              y: ball.y + ball.vy
            };

            // Bounce off side walls
            if (updatedBall.x < playAreaStartX || updatedBall.x > playAreaEndX - BALL_SIZE) {
              updatedBall.vx = -updatedBall.vx; 
              updatedBall.x = Math.max(playAreaStartX, Math.min(updatedBall.x, playAreaEndX - BALL_SIZE)); 
            }

            // --- Collision with key blocks ---
            const hitBlock = keyBlocks.find(block => checkCollision(updatedBall, block));

            if (hitBlock) {
              if (hitBlock.isOpen) { 
                // Ball hits an OPEN block (key NOT pressed) - Ball continues to fall
                // No score/health change here. It's just passing through.
              } else { 
                // !hitBlock.isOpen - Ball hits a CLOSED block (key IS pressed) - Ball BLOCKED!
                if (!updatedBall.isBlockedAndBouncing) { // Ensure score/sound only once per block
                    updateScore(10); 
                    setBallsBlocked(prev => prev + 1);
                    if (settings.soundEnabled) {
                        playSound(600, 0.2); 
                    }
                    updatedBall.vy = -Math.abs(updatedBall.vy) * 0.8; // Bounce up
                    updatedBall.isBlockedAndBouncing = true; // Mark for bounce animation
                    updatedBall.removedAt = Date.now() + BOUNCE_ANIMATION_DURATION; // Mark for removal after delay
                }
              }
            } 

            // --- Check if ball reached the very bottom of the screen (passed all barriers) ---
            if (!updatedBall.isBlockedAndBouncing && updatedBall.y > window.innerHeight - (BALL_SIZE / 2)) {
                updateScore(-15); // Severe penalty for missing entirely
                updateHealth(-15);
                setBallsPassed(prev => prev + 1); // Increment balls passed counter
                if (settings.soundEnabled) {
                    playSound(150, 0.4); 
                }
                // This ball is effectively removed by not being pushed into newBalls
            } else {
                // Ball is still active (not blocked and not at floor)
                newBalls.push(updatedBall); 
            }
          });
          return newBalls;
        });
      }, 16); // ~60 FPS for physics updates
    }

    return () => {
      clearInterval(gamePhysicsLoop);
    };
  }, [gameStarted, gameOver, keyBlocks, checkCollision, updateScore, updateHealth, settings, playAreaStartX, playAreaEndX]);


  // --- Dynamic Difficulty (Ball Speed and Spawn Rate) ---
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    setCurrentBallSpeed(INITIAL_BALL_SPEED + (gameState.level - 1) * BALL_SPEED_INCREASE_PER_LEVEL);
    const newInterval = Math.max(MIN_BALL_SPAWN_INTERVAL, INITIAL_BALL_SPAWN_INTERVAL - (gameState.level - 1) * SPAWN_INTERVAL_DECREASE_RATE);
    setCurrentSpawnInterval(newInterval);
  }, [gameState.level, gameStarted, gameOver]);

  // --- NEW: useEffect for Survival Timer ---
  useEffect(() => {
    let survivalTimer: NodeJS.Timeout;
    if (gameStarted && !gameOver) {
      survivalTimer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1); // Increment every second
      }, 1000); // Update every 1000ms (1 second)
    }

    // Cleanup function for the timer
    return () => {
      clearInterval(survivalTimer);
    };
  }, [gameStarted, gameOver]); // Dependencies: Timer runs when game is started and not over

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (gameState.health <= 0) {
      setGameOver(true);
      setGameStarted(false); 
    }
  }, [gameState.health]);

  const startGame = () => {
    setGameStarted(true);
    initializeGame();
  };

  const restartGame = () => {
    setGameStarted(false);
    setGameOver(false);
    initializeGame();
  };

  return (
    <GameLayout
      gameTitle="Barrera de Teclas"
      gameType="keyBarrier"
      className="bg-gradient-to-b from-yellow-400 to-orange-600 relative overflow-hidden"
    >
      <div className="relative w-full h-screen">
        {/* Balls */}
        {balls.map((ball) => (
          <div
            key={ball.id} 
            className="absolute w-8 h-8 bg-coral rounded-full shadow-lg" 
            style={{
              left: `${ball.x}px`,
              top: `${ball.y}px`,
              opacity: ball.isBlockedAndBouncing ? 0.5 : 1, 
              transform: ball.isBlockedAndBouncing ? 'scale(0.8)' : 'scale(1)', 
              transition: ball.isBlockedAndBouncing ? `all ${BOUNCE_ANIMATION_DURATION / 2}ms ease-out` : 'none' 
            }}
          />
        ))}

        {/* Key Blocks */}
        {keyBlocks.map((block, index) => (
          <div
            key={index}
            className={`absolute flex items-center justify-center font-bold text-lg rounded-lg shadow-lg transition-all duration-200 
              ${block.isOpen 
                ? 'bg-transparent border-2 border-white/50 text-white/50' 
                : block.row === 0 
                  ? 'bg-yellow border-2 border-yellow text-dark' 
                  : 'bg-danger border-2 border-danger text-white' 
              }`}
            style={{
              left: `${block.x}px`,
              top: `${block.y}px`,
              width: `${block.width}px`,
              height: `${block.height}px`,
            }}
          >
            {block.key}
          </div>
        ))}

        {/* Game Stats */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-sm">
            <div className="font-bold text-dark">Tiempo: {elapsedTime}s</div> {/* <-- DISPLAY TIMER HERE */}
            <div className="font-bold text-dark">Salud: {gameState.health}</div>
            <div className="font-bold text-dark">Nivel: {gameState.level}</div>
            <div className="font-bold text-danger">Pelotas pasadas: {ballsPassed}</div>
            <div className="font-bold text-success">Pelotas bloqueadas: {ballsBlocked}</div>
            <div className="font-bold text-dark">Pelotas activas: {balls.length}</div>
            <div className="font-bold text-dark">Velocidad: {currentBallSpeed.toFixed(1)}</div>
            <div className="font-bold text-dark">Intervalo: {currentSpawnInterval}ms</div>
          </div>
        </div>

        {/* Game Controls */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl p-8 text-center">
              <h2 className="text-3xl font-fredoka text-dark mb-4">¡Barrera de Teclas!</h2>
              <p className="text-gray-600 mb-6">
                Mantén presionadas las teclas para **cerrar** los bloques y **bloquear** las pelotas. ¡Deja pasar las pelotas y perderás salud!
              </p>
              <button
                onClick={startGame}
                className="bg-yellow hover:bg-yellow/80 text-white px-8 py-3 rounded-full font-bold text-xl transition-all duration-300 hover:scale-105"
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
              <p className="text-gray-600 mb-4">Puntuación Final: {gameState.score}</p>
              <p className="text-gray-600 mb-4">¡Has durado **{elapsedTime}** segundos!</p> {/* <-- DISPLAY FINAL TIME */}
              <p className="text-gray-600 mb-6">Nivel Alcanzado: {gameState.level}</p>
              <button
                onClick={restartGame}
                className="bg-yellow hover:bg-yellow/80 text-white px-8 py-3 rounded-full font-bold text-xl transition-all duration-300 hover:scale-105"
              >
                Jugar de Nuevo
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {gameStarted && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center">
            <p className="text-dark font-bold">
              Mantén presionadas las teclas para **cerrar** los bloques correspondientes
            </p>
            <p className="text-sm text-gray-600 mt-1">
              +10 puntos por pelota bloqueada | -10 salud por pelota que pasa por un bloque abierto | -15 salud por pelota que llega al suelo
            </p>
          </div>
        )}
      </div>
    </GameLayout>
  );
}