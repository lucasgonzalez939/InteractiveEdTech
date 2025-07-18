import { Settings, Star, Gamepad2 } from 'lucide-react';
import { 
  CloudRain, 
  Brain, 
  Route, 
  Shield, 
  Mouse, 
  Hand, 
  Palette 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import GameCard from '@/components/game-card';
import SettingsModal from '@/components/settings-modal';
import { useGameState } from '@/hooks/use-game-state';
import { useState } from 'react';

export default function Home() {
  const { totalScore } = useGameState();
  const [showSettings, setShowSettings] = useState(false);

  const games = [
    {
      title: 'Lluvia de Letras',
      description: 'Presiona las teclas antes de que las letras toquen el suelo',
      icon: <CloudRain className="text-white text-2xl" />,
      gameType: 'letterRain',
      inputType: 'keyboard' as const,
      difficulty: 'easy' as const,
      bgColor: 'bg-coral',
      route: '/games/letter-rain'
    },
    {
      title: 'Memoria de Letras',
      description: 'Memoriza y escribe las secuencias de letras',
      icon: <Brain className="text-white text-2xl" />,
      gameType: 'letterMemory',
      inputType: 'keyboard' as const,
      difficulty: 'medium' as const,
      bgColor: 'bg-sky',
      route: '/games/letter-memory'
    },
    {
      title: 'Laberinto de Teclado',
      description: 'Navega el laberinto usando las filas del teclado',
      icon: <Route className="text-white text-2xl" />,
      gameType: 'keyboardMaze',
      inputType: 'keyboard' as const,
      difficulty: 'hard' as const,
      bgColor: 'bg-teal',
      route: '/games/keyboard-maze'
    },
    {
      title: 'Barrera de Teclas',
      description: 'Abre las barreras para que pase la pelota',
      icon: <Shield className="text-white text-2xl" />,
      gameType: 'keyBarrier',
      inputType: 'keyboard' as const,
      difficulty: 'easy' as const,
      bgColor: 'bg-yellow',
      route: '/games/key-barrier'
    },
    {
      title: 'Laberinto con Mouse',
      description: 'Guía el objeto a través del laberinto con el mouse',
      icon: <Mouse className="text-white text-2xl" />,
      gameType: 'mouseMaze',
      inputType: 'mouse' as const,
      difficulty: 'easy' as const,
      bgColor: 'bg-mint',
      route: '/games/mouse-maze'
    },
    {
      title: 'Arrastrar y Soltar',
      description: 'Arrastra los objetos para clasificarlos correctamente',
      icon: <Hand className="text-white text-2xl" />,
      gameType: 'dragDrop',
      inputType: 'mouse' as const,
      difficulty: 'medium' as const,
      bgColor: 'bg-plum',
      route: '/games/drag-drop'
    },
    {
      title: 'Dibujo Libre',
      description: 'Crea dibujos increíbles con colores y herramientas',
      icon: <Palette className="text-white text-2xl" />,
      gameType: 'drawing',
      inputType: 'mouse' as const,
      difficulty: 'easy' as const,
      bgColor: 'bg-warning',
      route: '/games/drawing'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-sky to-teal min-h-screen font-nunito">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gamepad2 className="text-coral text-3xl" />
              <h1 className="text-2xl font-fredoka text-dark">Juegos Educativos</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-yellow px-4 py-2 rounded-full shadow-md">
                <Star className="text-warning inline mr-1" />
                <span className="font-bold text-dark">{totalScore}</span>
              </div>
              <Button
                onClick={() => setShowSettings(true)}
                className="bg-mint hover:bg-mint/80 text-white p-2 rounded-full shadow-md"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Game Selection */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-fredoka text-white mb-4">¡Elige tu Juego!</h2>
          <p className="text-xl text-white/90">Practica teclado y mouse de manera divertida</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {games.map((game, index) => (
            <GameCard
              key={index}
              title={game.title}
              description={game.description}
              icon={game.icon}
              gameType={game.gameType}
              inputType={game.inputType}
              difficulty={game.difficulty}
              bgColor={game.bgColor}
              route={game.route}
            />
          ))}
        </div>
      </div>

      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
