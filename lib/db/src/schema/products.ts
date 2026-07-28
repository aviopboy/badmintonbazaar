import { boolean, jsonb, pgTable, text } from "drizzle-orm/pg-core";

export const productsTable = pgTable("bb_products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  price: text("price").notNull(),
  compareAt: text("compare_at"),
  description: text("description").notNull().default(""),
  image: text("image").notNull().default(""),
  tags: jsonb("tags").notNull().$type<string[]>().default([]),
  featured: boolean("featured").notNull().default(false),
  badge: text("badge"),
  showcase: text("showcase"),
});
