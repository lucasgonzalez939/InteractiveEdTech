import { useState, useEffect } from 'react';
import GameLayout from '@/components/game-layout';
import { useGameState } from '@/hooks/use-game-state';
import { playSound } from '@/lib/game-utils';
import { Apple, Car, Leaf, Heart, Fish, TreePine, Square, Flower, Sun, Moon, Star, Cloud, Droplet, Flame, Snowflake, Zap } from 'lucide-react';

interface DraggableItem {
  id: string;
  color: 'red' | 'blue' | 'green';
  icon: React.ReactNode;
  placed: boolean;
}

interface DropZone {
  id: string;
  color: 'red' | 'blue' | 'green';
  name: string;
  items: DraggableItem[];
}

export default function DragDrop() {
  const { gameState, updateScore, updateLevel, settings } = useGameState();
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  
  const [draggableItems, setDraggableItems] = useState<DraggableItem[]>([
    // Red items
    { id: '1', color: 'red', icon: <Apple className="text-2xl" />, placed: false },
    { id: '2', color: 'red', icon: <Heart className="text-2xl" />, placed: false },
    { id: '3', color: 'red', icon: <Flower className="text-2xl" />, placed: false },
    { id: '4', color: 'red', icon: <Sun className="text-2xl" />, placed: false },
    { id: '5', color: 'red', icon: <Flame className="text-2xl" />, placed: false },
    // Blue items
    { id: '6', color: 'blue', icon: <Car className="text-2xl" />, placed: false },
    { id: '7', color: 'blue', icon: <Fish className="text-2xl" />, placed: false },
    { id: '8', color: 'blue', icon: <Droplet className="text-2xl" />, placed: false },
    { id: '9', color: 'blue', icon: <Moon className="text-2xl" />, placed: false },
    { id: '10', color: 'blue', icon: <Snowflake className="text-2xl" />, placed: false },
    // Green items
    { id: '11', color: 'green', icon: <Leaf className="text-2xl" />, placed: false },
    { id: '12', color: 'green', icon: <TreePine className="text-2xl" />, placed: false },
    { id: '13', color: 'green', icon: <Star className="text-2xl" />, placed: false },
    { id: '14', color: 'green', icon: <Cloud className="text-2xl" />, placed: false },
    { id: '15', color: 'green', icon: <Zap className="text-2xl" />, placed: false },
  ]);

  const [dropZones, setDropZones] = useState<DropZone[]>([
    { id: 'red', color: 'red', name: 'Rojo', items: [] },
    { id: 'blue', color: 'blue', name: 'Azul', items: [] },
    { id: 'green', color: 'green', name: 'Verde', items: [] },
  ]);

  const handleDragStart = (item: DraggableItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetZoneId: string) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    const targetZone = dropZones.find(zone => zone.id === targetZoneId);
    if (!targetZone) return;
    
    // Check if the color matches
    if (draggedItem.color === targetZone.color) {
      // Correct drop
      setDropZones(prev => prev.map(zone => 
        zone.id === targetZoneId 
          ? { ...zone, items: [...zone.items, draggedItem] }
          : zone
      ));
      
      setDraggableItems(prev => prev.map(item => 
        item.id === draggedItem.id 
          ? { ...item, placed: true }
          : item
      ));
      
      updateScore(10);
      
      if (settings.soundEnabled) {
        playSound(600, 0.3);
      }
      
      // Check if all items are placed
      const allPlaced = draggableItems.every(item => 
        item.id === draggedItem.id || item.placed
      );
      
      if (allPlaced) {
        const endTime = Date.now();
        const timeTaken = (endTime - (startTime || endTime)) / 1000;
        setCompletionTime(timeTaken);
        setGameWon(true);
        
        // Base score plus time bonus
        let totalScore = 50; // Base completion bonus
        if (timeTaken < 30) {
          totalScore += 100; // Fast completion bonus
        } else if (timeTaken < 60) {
          totalScore += 50; // Medium completion bonus
        }
        
        updateScore(totalScore);
        updateLevel();
        
        if (settings.soundEnabled) {
          playSound(800, 0.5);
        }
      }
    } else {
      // Wrong drop
      if (settings.soundEnabled) {
        playSound(200, 0.3);
      }
    }
    
    setDraggedItem(null);
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red': return 'bg-coral border-coral text-coral';
      case 'blue': return 'bg-sky border-sky text-sky';
      case 'green': return 'bg-mint border-mint text-mint';
      default: return 'bg-gray-500 border-gray-500 text-gray-500';
    }
  };

  const getZoneClasses = (color: string) => {
    switch (color) {
      case 'red': return 'bg-coral/20 border-coral';
      case 'blue': return 'bg-sky/20 border-sky';
      case 'green': return 'bg-mint/20 border-mint';
      default: return 'bg-gray-500/20 border-gray-500';
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameWon(false);
    setStartTime(Date.now());
    setCompletionTime(null);
    setDraggableItems(prev => prev.map(item => ({ ...item, placed: false })));
    setDropZones([
      { id: 'red', color: 'red', name: 'Rojo', items: [] },
      { id: 'blue', color: 'blue', name: 'Azul', items: [] },
      { id: 'green', color: 'green', name: 'Verde', items: [] },
    ]);
  };

  const restartGame = () => {
    setGameStarted(false);
    setGameWon(false);
    setDraggedItem(null);
    setStartTime(null);
    setCompletionTime(null);
    startGame();
  };

  return (
    <GameLayout
      gameTitle="Arrastrar y Soltar"
      gameType="dragDrop"
      className="bg-gradient-to-br from-plum to-purple-600"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-fredoka text-dark mb-6 text-center">
              Clasificar Colores
            </h2>
            
            {/* Drop Zones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {dropZones.map(zone => (
                <div
                  key={zone.id}
                  className={`drop-zone ${getZoneClasses(zone.color)} border-4 border-dashed rounded-2xl p-6 min-h-32 flex flex-col items-center justify-center transition-all duration-300`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, zone.id)}
                >
                  <Square className={`${getColorClasses(zone.color)} text-4xl mb-2`} />
                  <h3 className="text-lg font-bold text-dark mb-2">{zone.name}</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {zone.items.map(item => (
                      <div
                        key={item.id}
                        className={`${getColorClasses(item.color)} text-white w-12 h-12 rounded-lg flex items-center justify-center shadow-lg`}
                      >
                        {item.icon}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Game Controls */}
            {!gameStarted && !gameWon && (
              <div className="text-center mb-6">
                <button
                  onClick={startGame}
                  className="bg-plum hover:bg-plum/80 text-white px-8 py-3 rounded-full font-bold text-xl transition-all duration-300 hover:scale-105"
                >
                  Comenzar
                </button>
              </div>
            )}

            {/* Win Message */}
            {gameWon && (
              <div className="text-center mb-6">
                <div className="bg-success/20 text-success p-4 rounded-xl">
                  <h3 className="text-2xl font-fredoka mb-2">¡Clasificación Completada!</h3>
                  <p>¡Excelente trabajo! Todos los objetos están en su lugar correcto.</p>
                  {completionTime && (
                    <div className="mt-2">
                      <p className="text-sm">Tiempo: {completionTime.toFixed(1)}s</p>
                      {completionTime < 30 && (
                        <p className="text-sm font-bold text-yellow-600">¡Bono de velocidad: +100 puntos!</p>
                      )}
                      {completionTime >= 30 && completionTime < 60 && (
                        <p className="text-sm font-bold text-orange-600">¡Buen tiempo: +50 puntos!</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Draggable Items */}
            {gameStarted && !gameWon && (
              <div className="bg-gray-100 rounded-xl p-6">
                <h3 className="text-xl font-bold text-dark mb-4 text-center">
                  Arrastra los objetos a su color correspondiente
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 justify-items-center">
                  {draggableItems.filter(item => !item.placed).map(item => (
                    <div
                      key={item.id}
                      className={`${getColorClasses(item.color)} text-white w-16 h-16 rounded-lg flex items-center justify-center cursor-move shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
                      draggable
                      onDragStart={() => handleDragStart(item)}
                    >
                      {item.icon}
                    </div>
                  ))}
                </div>
                
                {/* Game Timer */}
                {startTime && !gameWon && (
                  <div className="mt-4 text-center">
                    <div className="bg-gray-200 px-4 py-2 rounded-full inline-block">
                      <span className="font-bold text-dark">
                        Tiempo: {Math.floor((Date.now() - startTime) / 1000)}s
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            {!gameStarted && (
              <div className="bg-gray-100 rounded-xl p-6 text-center">
                <p className="text-dark font-bold mb-2">
                  Arrastra cada objeto a la zona de color correspondiente
                </p>
                <p className="text-sm text-gray-600">
                  ¡Clasifica todos los objetos correctamente para ganar!
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Completa en menos de 30 segundos para obtener un bono de velocidad
                </p>
              </div>
            )}

            {/* Restart Button */}
            {gameWon && (
              <div className="text-center mt-6">
                <button
                  onClick={restartGame}
                  className="bg-plum hover:bg-plum/80 text-white px-6 py-2 rounded-full font-bold transition-all duration-300 hover:scale-105"
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
