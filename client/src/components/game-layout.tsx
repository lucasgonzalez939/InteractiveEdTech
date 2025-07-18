import { ReactNode } from 'react';
import GameHeader from './game-header';

interface GameLayoutProps {
  children: ReactNode;
  gameTitle: string;
  gameType: string;
  className?: string;
}

export default function GameLayout({ children, gameTitle, gameType, className = '' }: GameLayoutProps) {
  return (
    <div className={`min-h-screen ${className}`}>
      <GameHeader gameTitle={gameTitle} gameType={gameType} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
