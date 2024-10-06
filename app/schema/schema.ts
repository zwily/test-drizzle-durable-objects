import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const messagesTable = sqliteTable("messages", {
  id: integer("id").primaryKey(),
  createdAt: integer("created_at").default(sql`CURRENT_TIMESTAMP`),
  user: text("user"),
  message: text("message"),
});
