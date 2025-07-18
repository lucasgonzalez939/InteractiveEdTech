import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameScoreSchema, insertGameSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Game Scores API
  app.get("/api/scores/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const scores = await storage.getGameScores(userId);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Error fetching scores" });
    }
  });

  app.get("/api/highscores/:gameType", async (req, res) => {
    try {
      const gameType = req.params.gameType;
      const scores = await storage.getHighScores(gameType);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Error fetching high scores" });
    }
  });

  app.post("/api/scores", async (req, res) => {
    try {
      const scoreData = insertGameScoreSchema.parse(req.body);
      const score = await storage.createGameScore(scoreData);
      res.json(score);
    } catch (error) {
      res.status(400).json({ message: "Invalid score data" });
    }
  });

  // Game Settings API
  app.get("/api/settings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settings = await storage.getUserSettings(userId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching settings" });
    }
  });

  app.post("/api/settings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settingsData = insertGameSettingsSchema.parse(req.body);
      const settings = await storage.updateUserSettings(userId, settingsData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid settings data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
