import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  gameType: text("game_type").notNull(),
  score: integer("score").notNull().default(0),
  level: integer("level").notNull().default(1),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const gameSettings = pgTable("game_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  volume: integer("volume").notNull().default(50),
  difficulty: text("difficulty").notNull().default("easy"),
  soundEnabled: boolean("sound_enabled").notNull().default(true),
  animationsEnabled: boolean("animations_enabled").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameScoreSchema = createInsertSchema(gameScores).pick({
  userId: true,
  gameType: true,
  score: true,
  level: true,
});

export const insertGameSettingsSchema = createInsertSchema(gameSettings).pick({
  userId: true,
  volume: true,
  difficulty: true,
  soundEnabled: true,
  animationsEnabled: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameScore = typeof gameScores.$inferSelect;
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
export type GameSettings = typeof gameSettings.$inferSelect;
export type InsertGameSettings = z.infer<typeof insertGameSettingsSchema>;
