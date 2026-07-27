import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const ordersTable = pgTable("bb_orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  additionalContact: text("additional_contact").notNull(),
  paymentReference: text("payment_reference").notNull(),
  paymentProof: text("payment_proof").notNull(),
  status: text("status").notNull(),
  reviewMessage: text("review_message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  items: jsonb("items").notNull(),
  total: text("total").notNull(),
});
