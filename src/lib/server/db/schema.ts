import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  userId: text("user_id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export type User = typeof users.$inferSelect;

export const sessions = sqliteTable("sessions", {
  sessionId: text("session_id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade", onUpdate: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export type Session = typeof sessions.$inferSelect;

export const labels = sqliteTable("labels", {
  labelId: integer("label_id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => users.userId),
});

export type Label = typeof labels.$inferSelect;
