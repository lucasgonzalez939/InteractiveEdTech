import { useState, useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';

interface GameState {
  score: number;
  level: number;
  health: number;
  totalScore: number;
}

interface GameSettings {
  volume: number;
  difficulty: 'easy' | 'medium' | 'hard';
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

const initialGameState: GameState = {
  score: 0,
  level: 1,
  health: 3,
  totalScore: 0,
};

const initialSettings: GameSettings = {
  volume: 50,
  difficulty: 'easy',
  soundEnabled: true,
  animationsEnabled: true,
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [settings, setSettings] = useLocalStorage<GameSettings>('gameSettings', initialSettings);
  const [totalScore, setTotalScore] = useLocalStorage<number>('totalScore', 0);

  const updateScore = useCallback((points: number) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
    }));
  }, []);

  const updateLevel = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      level: prev.level + 1,
    }));
  }, []);

  const updateHealth = useCallback((change: number) => {
    setGameState(prev => ({
      ...prev,
      health: Math.max(0, prev.health + change),
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(initialGameState);
  }, []);

  const saveScore = useCallback((gameType: string) => {
    const newTotal = totalScore + gameState.score;
    setTotalScore(newTotal);
    setGameState(prev => ({
      ...prev,
      totalScore: newTotal,
    }));
  }, [gameState.score, totalScore, setTotalScore]);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, [setSettings]);

  return {
    gameState,
    settings,
    totalScore,
    updateScore,
    updateLevel,
    updateHealth,
    resetGame,
    saveScore,
    updateSettings,
  };
}
