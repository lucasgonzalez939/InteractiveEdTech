import { ArrowLeft, Settings, Star, Heart, Layers } from 'lucide-react';
import { useLocation } from 'wouter';
import { useGameState } from '@/hooks/use-game-state';
import { Button } from '@/components/ui/button';
import SettingsModal from './settings-modal';
import { useState } from 'react';

interface GameHeaderProps {
  gameTitle: string;
  gameType: string;
}

export default function GameHeader({ gameTitle, gameType }: GameHeaderProps) {
  const [, setLocation] = useLocation();
  const { gameState, totalScore } = useGameState();
  const [showSettings, setShowSettings] = useState(false);

  const handleBackToMenu = () => {
    setLocation('/');
  };

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleBackToMenu}
                className="bg-coral hover:bg-coral/80 text-white font-fredoka"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Menú
              </Button>
              <h1 className="text-xl font-fredoka text-dark">{gameTitle}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-yellow px-4 py-2 rounded-full shadow-md">
                <Star className="w-4 h-4 text-warning inline mr-1" />
                <span className="font-bold text-dark">{gameState.score}</span>
              </div>
              
              {gameType === 'letterRain' || gameType === 'keyBarrier' ? (
                <div className="bg-mint px-4 py-2 rounded-full shadow-md">
                  <Heart className="w-4 h-4 text-white inline mr-1" />
                  <span className="font-bold text-white">{gameState.health}</span>
                </div>
              ) : null}
              
              <div className="bg-sky px-4 py-2 rounded-full shadow-md">
                <Layers className="w-4 h-4 text-white inline mr-1" />
                <span className="font-bold text-white">{gameState.level}</span>
              </div>
              
              <div className="bg-yellow px-4 py-2 rounded-full shadow-md">
                <Star className="w-4 h-4 text-warning inline mr-1" />
                <span className="font-bold text-dark">{totalScore}</span>
              </div>
              
              <Button
                onClick={() => setShowSettings(true)}
                className="bg-mint hover:bg-mint/80 text-white p-2 rounded-full"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
