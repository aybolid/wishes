import { relations } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  userId: text("user_id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  labels: many(labels, { relationName: "labels" }),
  metadataFields: many(metadataFields, { relationName: "metadataFields" }),
}));

export type User = typeof users.$inferSelect;
export type SafeUser = Omit<User, "passwordHash">;

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

export const labelsRelations = relations(labels, ({ one }) => ({
  creator: one(users, {
    relationName: "creator",
    fields: [labels.creatorId],
    references: [users.userId],
  }),
}));

export type Label = typeof labels.$inferSelect;
export type LabelWithCreator = Label & { creator: SafeUser };

export const metadataFields = sqliteTable("metadata_fields", {
  fieldId: integer("field_id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => users.userId),
  config: text({ mode: "json" }).notNull().$type<MetadataFieldConfig>(),
});

export const metadataFieldsRelations = relations(metadataFields, ({ one }) => ({
  creator: one(users, {
    relationName: "creator",
    fields: [metadataFields.creatorId],
    references: [users.userId],
  }),
}));

export type MetadataFieldConfig =
  | TextMetadataFieldConfig
  | BooleanMetadataFieldConfig
  | OptionMetadataFieldConfig
  | NumberMetadataFieldConfig;

export type TextMetadataFieldConfig = {
  type: "text";
};

export type BooleanMetadataFieldConfig = {
  type: "boolean";
};

export type OptionMetadataFieldConfig = {
  type: "option";
  options: string[];
};

export type NumberMetadataFieldConfig = {
  type: "number";
};

export type MetadataField = typeof metadataFields.$inferSelect;
export type MetadataFieldWithCreator = MetadataField & { creator: SafeUser };
