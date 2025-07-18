import { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/game-layout';
import { useGameState } from '@/hooks/use-game-state';
// Import the new solvable maze function
import { createSolvableMaze, playSound } from '@/lib/game-utils'; // Or whatever path you choose for maze-generator

interface Position {
  x: number;
  y: number;
}

export default function KeyboardMaze() {
  const { gameState, updateScore, updateLevel, settings } = useGameState();
  const [maze, setMaze] = useState<number[][]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 1, y: 1 });
  const [goalPos, setGoalPos] = useState<Position>({ x: 8, y: 8 });
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRow, setCurrentRow] = useState(1); // 1: QWERTY, 2: ASDF, 3: ZXCV
  const [gameWon, setGameWon] = useState(false);

  const mazeSize = 10;

  const keyRows = {
    1: ['W', 'D', 'S', 'A'], // Up, Right, Down, Left (QWERTY home row for movement)
    2: ['I', 'L', 'K', 'J'], // Example: keys from another row, e.g., ASDF or similar (choose as desired)
    3: ['H', 'P', 'O', 'M'], // Example: keys from yet another row (choose as desired)
  };

  const initializeMaze = useCallback(() => {
    // --- CHANGE IS HERE ---
    const newMaze = createSolvableMaze(mazeSize, mazeSize); // Use the new function
    setMaze(newMaze);
    setPlayerPos({ x: 1, y: 1 });
    setGoalPos({ x: mazeSize - 3, y: mazeSize - 3 }); // Ensure these are valid path cells after generation
    setGameWon(false);
  }, [mazeSize]); // mazeSize should be a dependency if it could change

  const movePlayer = useCallback((direction: number) => {
    const directions = [
      { x: 0, y: -1 }, // Up
      { x: 1, y: 0 },  // Right
      { x: 0, y: 1 },  // Down
      { x: -1, y: 0 }  // Left
    ];

    const move = directions[direction];
    setPlayerPos(prev => {
      const newX = prev.x + move.x;
      const newY = prev.y + move.y;

      // Check bounds and walls
      if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize && maze[newY][newX] === 0) {
        if (settings.soundEnabled) {
          playSound(440, 0.1);
        }
        return { x: newX, y: newY };
      }

      return prev;
    });
  }, [maze, mazeSize, settings]); // Add mazeSize as dependency for movePlayer

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!gameStarted || gameWon) return;

    const key = event.key.toUpperCase();
    const currentKeys = keyRows[currentRow as keyof typeof keyRows];
    const keyIndex = currentKeys.indexOf(key);

    if (keyIndex !== -1) {
      movePlayer(keyIndex);
    }
  }, [gameStarted, gameWon, currentRow, movePlayer]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    initializeMaze();
  }, [initializeMaze]);

  useEffect(() => {
    if (playerPos.x === goalPos.x && playerPos.y === goalPos.y) {
      setGameWon(true);
      updateScore(50);
      updateLevel();
      if (settings.soundEnabled) {
        playSound(800, 0.5);
      }

      // Progress to next keyboard row
      setTimeout(() => {
        setCurrentRow(prev => Math.min(prev + 1, 3));
        initializeMaze();
      }, 2000);
    }
  }, [playerPos, goalPos, updateScore, updateLevel, settings, initializeMaze]);

  const startGame = () => {
    setGameStarted(true);
    initializeMaze();
  };

  const restartGame = () => {
    setGameStarted(false);
    setCurrentRow(1);
    initializeMaze();
  };

  return (
    <GameLayout
      gameTitle="Laberinto de Teclado"
      gameType="keyboardMaze"
      className="bg-gradient-to-br from-green-400 to-teal-600"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-fredoka text-dark mb-6 text-center">
              Laberinto de Teclado - Fila {currentRow}
            </h2>

            {/* Maze Container */}
            <div className="bg-gray-900 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-10 gap-1 mx-auto" style={{ width: 'fit-content' }}>
                {maze.map((row, y) =>
                  row.map((cell, x) => (
                    <div
                      key={`${x}-${y}`}
                      className={`w-8 h-8 ${
                        cell === 1 ? 'bg-white' : 'bg-gray-800'
                      } ${
                        playerPos.x === x && playerPos.y === y ? 'bg-coral' : ''
                      } ${
                        goalPos.x === x && goalPos.y === y ? 'bg-yellow animate-pulse' : ''
                      } rounded-sm`}
                    >
                      {playerPos.x === x && playerPos.y === y && (
                        <div className="w-full h-full bg-coral rounded-sm"></div>
                      )}
                      {goalPos.x === x && goalPos.y === y && (
                        <div className="w-full h-full bg-yellow rounded-sm animate-pulse"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Game Controls */}
            {!gameStarted && (
              <div className="text-center mb-6">
                <button
                  onClick={startGame}
                  className="bg-teal hover:bg-teal/80 text-white px-8 py-3 rounded-full font-bold text-xl transition-all duration-300 hover:scale-105"
                >
                  Comenzar
                </button>
              </div>
            )}

            {/* Win Message */}
            {gameWon && (
              <div className="text-center mb-6">
                <div className="bg-success/20 text-success p-4 rounded-xl">
                  <h3 className="text-2xl font-fredoka mb-2">¡Nivel Completado!</h3>
                  <p>¡Excelente trabajo! Avanzando a la siguiente fila...</p>
                </div>
              </div>
            )}

            {/* Keyboard Instructions */}
            <div className="bg-gray-100 rounded-xl p-6">
              <h3 className="text-xl font-bold text-dark mb-4 text-center">
                Controles de Teclado - Fila {currentRow}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="bg-yellow/20 p-4 rounded-lg">
                  <h4 className="font-bold text-dark mb-2">Arriba</h4>
                  <kbd className="bg-white px-3 py-2 rounded text-lg font-bold">
                    {keyRows[currentRow as keyof typeof keyRows][0]}
                  </kbd>
                </div>
                <div className="bg-mint/20 p-4 rounded-lg">
                  <h4 className="font-bold text-dark mb-2">Derecha</h4>
                  <kbd className="bg-white px-3 py-2 rounded text-lg font-bold">
                    {keyRows[currentRow as keyof typeof keyRows][1]}
                  </kbd>
                </div>
                <div className="bg-sky/20 p-4 rounded-lg">
                  <h4 className="font-bold text-dark mb-2">Abajo</h4>
                  <kbd className="bg-white px-3 py-2 rounded text-lg font-bold">
                    {keyRows[currentRow as keyof typeof keyRows][2]}
                  </kbd>
                </div>
                <div className="bg-coral/20 p-4 rounded-lg">
                  <h4 className="font-bold text-dark mb-2">Izquierda</h4>
                  <kbd className="bg-white px-3 py-2 rounded text-lg font-bold">
                    {keyRows[currentRow as keyof typeof keyRows][3]}
                  </kbd>
                </div>
              </div>
            </div>

            {/* Restart Button */}
            {gameStarted && (
              <div className="text-center mt-6">
                <button
                  onClick={restartGame}
                  className="bg-coral hover:bg-coral/80 text-white px-6 py-2 rounded-full font-bold transition-all duration-300 hover:scale-105"
                >
                  Reiniciar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}