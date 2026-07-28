import { pgTable, text } from "drizzle-orm/pg-core";

export const settingsTable = pgTable("bb_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
