import { relations } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  userId: text("user_id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  labels: many(labels),
  metadataFields: many(metadataFields),
  wishes: many(wishes),
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

export const labelsRelations = relations(labels, ({ one, many }) => ({
  creator: one(users, {
    fields: [labels.creatorId],
    references: [users.userId],
  }),
  wishesToLabels: many(wishesToLabels),
}));

export type Label = typeof labels.$inferSelect;
export type LabelWithCreator = Label & { creator: SafeUser };

export const wishes = sqliteTable("wishes", {
  wishId: integer("wish_id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description").notNull(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const wishesRelations = relations(wishes, ({ one, many }) => ({
  creator: one(users, {
    fields: [wishes.creatorId],
    references: [users.userId],
  }),
  metadataValues: many(metadataValues),
  wishesToLabels: many(wishesToLabels),
}));

export const wishesToLabels = sqliteTable("wishes_to_labels", {
  id: integer("id").primaryKey(),
  wishId: integer("wish_id")
    .notNull()
    .references(() => wishes.wishId, { onDelete: "cascade", onUpdate: "cascade" }),
  labelId: integer("label_id")
    .notNull()
    .references(() => labels.labelId, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const wishesToLabelsRelations = relations(wishesToLabels, ({ one }) => ({
  wish: one(wishes, {
    fields: [wishesToLabels.wishId],
    references: [wishes.wishId],
  }),
  label: one(labels, {
    fields: [wishesToLabels.labelId],
    references: [labels.labelId],
  }),
}));

export type Wish = typeof wishes.$inferSelect;
export type CompleteWish = Wish & {
  creator: SafeUser;
  metadataValues: MetadataValueWithField[];
  labels: { labelId: number; label: Label }[];
};

export const metadataValues = sqliteTable("metadata_values", {
  valueId: integer("value_id").primaryKey(),
  value: text("value").notNull(),
  metadataFieldId: integer("metadata_field_id")
    .notNull()
    .references(() => metadataFields.fieldId, { onDelete: "cascade", onUpdate: "cascade" }),
  wishId: integer("wish_id")
    .notNull()
    .references(() => wishes.wishId, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const metadataValuesRelations = relations(metadataValues, ({ one }) => ({
  metadataField: one(metadataFields, {
    fields: [metadataValues.metadataFieldId],
    references: [metadataFields.fieldId],
  }),
  wish: one(wishes, {
    fields: [metadataValues.wishId],
    references: [wishes.wishId],
  }),
}));

export type MetadataValue = typeof metadataValues.$inferSelect;
export type MetadataValueWithField = MetadataValue & { metadataField: MetadataFieldWithCreator };

export const metadataFields = sqliteTable("metadata_fields", {
  fieldId: integer("field_id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => users.userId),
  config: text({ mode: "json" }).notNull().$type<MetadataFieldConfig>(),
});

export const metadataFieldsRelations = relations(metadataFields, ({ one, many }) => ({
  creator: one(users, {
    fields: [metadataFields.creatorId],
    references: [users.userId],
  }),
  metadataValues: many(metadataValues), // Added this relation
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
