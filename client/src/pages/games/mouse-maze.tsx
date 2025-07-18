import { useState, useEffect, useCallback, useRef } from 'react';
import GameLayout from '@/components/game-layout';
import { useGameState } from '@/hooks/use-game-state';
import { createSolvableMaze, playSound } from '@/lib/game-utils';

interface Position {
  x: number;
  y: number;
}

export default function MouseMaze() {
  const { gameState, updateScore, updateLevel, settings } = useGameState();
  const [maze, setMaze] = useState<number[][]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [goalPos, setGoalPos] = useState<Position>({ x: 0, y: 0 });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  // Use useState for isDragging - it will trigger re-renders
  const [isDragging, setIsDragging] = useState(false); 
  const mazeRef = useRef<HTMLDivElement>(null);

  const logicalMazeSize = 10; 
  const cellSize = 20; 
  const playerSize = 16; 
  const playerRadius = playerSize / 2; 

  const actualGridSize = logicalMazeSize * 2 - 1; 
  const mazePixelWidth = actualGridSize * cellSize; 
  const mazePixelHeight = actualGridSize * cellSize; 

  const initializeMaze = useCallback(() => {
    const newMaze = createSolvableMaze(actualGridSize, actualGridSize); 
    setMaze(newMaze);

    setPlayerPos({ x: cellSize, y: cellSize });

    const goalGridX = actualGridSize - 2;
    const goalGridY = actualGridSize - 2;
    setGoalPos({ x: goalGridX * cellSize, y: goalGridY * cellSize });

    setGameWon(false);
    setTimeLeft(120);
    setIsDragging(false); // Reset dragging state on new game
  }, [actualGridSize, cellSize]);


  const checkWallCollision = useCallback((x: number, y: number): boolean => {
    const collisionPoints = [
      { px: x, py: y },            // Top-left
      { px: x + playerSize - 1, py: y },   // Top-right
      { px: x, py: y + playerSize - 1 },   // Bottom-left
      { px: x + playerSize - 1, py: y + playerSize - 1 } // Bottom-right
    ];

    for (const p of collisionPoints) {
      const gridX = Math.floor(p.px / cellSize);
      const gridY = Math.floor(p.py / cellSize);

      if (gridX < 0 || gridX >= actualGridSize || gridY < 0 || gridY >= actualGridSize) {
        return true; 
      }

      if (maze[gridY] && maze[gridY][gridX] === 1) {
        return true; 
      }
    }
    return false; 
  }, [maze, cellSize, actualGridSize, playerSize]);


  // --- MODIFIED handleMouseDown ---
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!gameStarted || gameWon) return;
    event.preventDefault(); // Crucial: Prevent default browser dragging behavior

    const rect = mazeRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const playerActualCenterX = playerPos.x + playerRadius;
    const playerActualCenterY = playerPos.y + playerRadius;

    const distance = Math.sqrt(
      Math.pow(mouseX - playerActualCenterX, 2) + Math.pow(mouseY - playerActualCenterY, 2)
    );

    // Only start dragging if click is within player's hit area
    if (distance <= playerRadius + 5) { // Slightly increased hit area for usability
      setIsDragging(true);
      // Immediately set player position to prevent jump on initial drag
      // Calculate new player position based on mouse (centered)
      let newX = event.clientX - rect.left - playerRadius;
      let newY = event.clientY - rect.top - playerRadius;

      // Clamp to boundaries
      newX = Math.max(0, Math.min(newX, mazePixelWidth - playerSize));
      newY = Math.max(0, Math.min(newY, mazePixelHeight - playerSize));

      // Check for immediate collision at starting drag point
      if (!checkWallCollision(newX, newY)) {
        setPlayerPos({ x: newX, y: newY });
      } else {
        // If start point is already in a wall, don't start dragging
        setIsDragging(false);
        if (settings.soundEnabled) {
          playSound(200, 0.05);
        }
      }
    }
  }, [gameStarted, gameWon, playerPos, playerRadius, mazePixelWidth, mazePixelHeight, playerSize, checkWallCollision, settings]);


  // --- MODIFIED handleMouseMove ---
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging || !gameStarted || gameWon) return; // Depend on isDragging state

    const rect = mazeRef.current?.getBoundingClientRect();
    if (!rect) return;

    let newX = event.clientX - rect.left - playerRadius; 
    let newY = event.clientY - rect.top - playerRadius;

    newX = Math.max(0, Math.min(newX, mazePixelWidth - playerSize));
    newY = Math.max(0, Math.min(newY, mazePixelHeight - playerSize));

    if (!checkWallCollision(newX, newY)) {
      setPlayerPos({ x: newX, y: newY });
      if (settings.soundEnabled) {
        playSound(440, 0.01); // Smaller sound duration for continuous movement
      }
    } else {
      if (settings.soundEnabled) {
        playSound(200, 0.05);
      }
      // Optional: If you want dragging to stop immediately on wall contact
      // setIsDragging(false); 
    }
  }, [isDragging, gameStarted, gameWon, checkWallCollision, settings, mazePixelWidth, mazePixelHeight, playerSize, playerRadius]);


  // --- MODIFIED handleMouseUp ---
  const handleMouseUp = useCallback(() => {
    setIsDragging(false); // Stop dragging
  }, []);


  // Timer
  useEffect(() => {
    if (!gameStarted || gameWon || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameStarted(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameWon, timeLeft]);

  // Check win condition
  useEffect(() => {
    const playerCenterX = playerPos.x + playerRadius;
    const playerCenterY = playerPos.y + playerRadius;
    const goalCenterX = goalPos.x + playerRadius; 
    const goalCenterY = goalPos.y + playerRadius;

    const distance = Math.sqrt(
      Math.pow(playerCenterX - goalCenterX, 2) + Math.pow(playerCenterY - goalCenterY, 2)
    );

    if (distance <= playerRadius + 5) { 
      setGameWon(true);
      updateScore(100);
      updateLevel();
      if (settings.soundEnabled) {
        playSound(800, 0.5);
      }
    }
  }, [playerPos, goalPos, updateScore, updateLevel, settings, playerRadius]);

  // Initial maze setup on component mount
  useEffect(() => {
    initializeMaze();
  }, [initializeMaze]);

  const startGame = () => {
    setGameStarted(true);
    initializeMaze(); 
  };

  const restartGame = () => {
    setGameStarted(false);
    setGameWon(false);
    setIsDragging(false); // Ensure dragging state is reset
    initializeMaze();
  };

  return (
    <GameLayout
      gameTitle="Laberinto con Mouse"
      gameType="mouseMaze"
      className="bg-gradient-to-br from-mint to-teal"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-fredoka text-dark mb-6 text-center">
              Laberinto con Mouse
            </h2>

            {/* Timer */}
            <div className="text-center mb-4">
              <div className="bg-mint px-4 py-2 rounded-full shadow-md inline-block">
                <span className="font-bold text-white">Tiempo: {timeLeft}s</span>
              </div>
            </div>

            {/* Maze Container */}
            <div className="bg-gray-900 rounded-xl p-4 mb-6">
              <div
                ref={mazeRef}
                className="relative bg-gray-800 rounded-lg cursor-pointer"
                style={{ width: `${mazePixelWidth}px`, height: `${mazePixelHeight}px`, margin: '0 auto' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove} // Attached here!
                onMouseUp={handleMouseUp}     // Attached here!
                onMouseLeave={handleMouseUp}  // Stops dragging if mouse leaves the maze
              >
                {/* Maze Walls */}
                {maze.map((row, y) =>
                  row.map((cell, x) => (
                    cell === 1 && (
                      <div
                        key={`${x}-${y}`}
                        className="absolute bg-white"
                        style={{
                          left: `${x * cellSize}px`,
                          top: `${y * cellSize}px`,
                          width: `${cellSize}px`,
                          height: `${cellSize}px`
                        }}
                      />
                    )
                  ))
                )}

                {/* Player */}
                <div
                  className={`absolute w-4 h-4 bg-coral rounded-full shadow-lg transition-all duration-75`}
                  style={{
                    left: `${playerPos.x}px`,
                    top: `${playerPos.y}px`,
                    cursor: isDragging ? 'grabbing' : 'grab' // Use isDragging state for cursor
                  }}
                />

                {/* Goal */}
                <div
                  className="absolute w-4 h-4 bg-yellow rounded-full shadow-lg animate-pulse" 
                  style={{
                    left: `${goalPos.x}px`,
                    top: `${goalPos.y}px`
                  }}
                />
              </div>
            </div>

            {/* Game Controls */}
            {!gameStarted && !gameWon && timeLeft > 0 && (
              <div className="text-center mb-6">
                <button
                  onClick={startGame}
                  className="bg-mint hover:bg-mint/80 text-white px-8 py-3 rounded-full font-bold text-xl transition-all duration-300 hover:scale-105"
                >
                  Comenzar
                </button>
              </div>
            )}
            {(gameWon || timeLeft === 0 && gameStarted) && (
                <div className="text-center mb-6">
                    {gameWon ? (
                        <div className="bg-success/20 text-success p-4 rounded-xl">
                            <h3 className="text-2xl font-fredoka mb-2">¡Laberinto Completado!</h3>
                            <p>¡Excelente trabajo! +100 puntos</p>
                        </div>
                    ) : (
                        <div className="bg-destructive/20 text-destructive p-4 rounded-xl">
                            <h3 className="2xl font-fredoka mb-2">¡Tiempo Agotado!</h3>
                            <p>Inténtalo de nuevo</p>
                        </div>
                    )}
                </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-100 rounded-xl p-6 text-center">
              <p className="text-dark font-bold mb-2">
                Arrastra el círculo rojo hasta el objetivo amarillo
              </p>
              <p className="text-sm text-gray-600">
                ¡Evita tocar las paredes blancas!
              </p>
            </div>

            {/* Restart Button */}
            {(gameWon || timeLeft === 0) && (
              <div className="text-center mt-6">
                <button
                  onClick={restartGame}
                  className="bg-coral hover:bg-coral/80 text-white px-6 py-2 rounded-full font-bold transition-all duration-300 hover:scale-105"
                >
                  Jugar de Nuevo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}