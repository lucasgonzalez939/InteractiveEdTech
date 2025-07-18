import { users, gameScores, gameSettings, type User, type InsertUser, type GameScore, type InsertGameScore, type GameSettings, type InsertGameSettings } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getGameScores(userId: number): Promise<GameScore[]>;
  getHighScores(gameType: string): Promise<GameScore[]>;
  createGameScore(score: InsertGameScore): Promise<GameScore>;
  
  getUserSettings(userId: number): Promise<GameSettings | undefined>;
  updateUserSettings(userId: number, settings: InsertGameSettings): Promise<GameSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gameScores: Map<number, GameScore>;
  private gameSettings: Map<number, GameSettings>;
  private currentUserId: number;
  private currentScoreId: number;
  private currentSettingsId: number;

  constructor() {
    this.users = new Map();
    this.gameScores = new Map();
    this.gameSettings = new Map();
    this.currentUserId = 1;
    this.currentScoreId = 1;
    this.currentSettingsId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getGameScores(userId: number): Promise<GameScore[]> {
    return Array.from(this.gameScores.values()).filter(
      (score) => score.userId === userId,
    );
  }

  async getHighScores(gameType: string): Promise<GameScore[]> {
    return Array.from(this.gameScores.values())
      .filter((score) => score.gameType === gameType)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  async createGameScore(insertScore: InsertGameScore): Promise<GameScore> {
    const id = this.currentScoreId++;
    const score: GameScore = { 
      id,
      userId: insertScore.userId || null,
      gameType: insertScore.gameType,
      score: insertScore.score || 0,
      level: insertScore.level || 1,
      completedAt: new Date()
    };
    this.gameScores.set(id, score);
    return score;
  }

  async getUserSettings(userId: number): Promise<GameSettings | undefined> {
    return Array.from(this.gameSettings.values()).find(
      (settings) => settings.userId === userId,
    );
  }

  async updateUserSettings(userId: number, insertSettings: InsertGameSettings): Promise<GameSettings> {
    const existingSettings = await this.getUserSettings(userId);
    
    if (existingSettings) {
      const updatedSettings: GameSettings = {
        ...existingSettings,
        ...insertSettings,
      };
      this.gameSettings.set(existingSettings.id, updatedSettings);
      return updatedSettings;
    } else {
      const id = this.currentSettingsId++;
      const settings: GameSettings = {
        id,
        userId: insertSettings.userId || null,
        volume: insertSettings.volume || 50,
        difficulty: insertSettings.difficulty || 'easy',
        soundEnabled: insertSettings.soundEnabled || true,
        animationsEnabled: insertSettings.animationsEnabled || true,
      };
      this.gameSettings.set(id, settings);
      return settings;
    }
  }
}

export const storage = new MemStorage();
