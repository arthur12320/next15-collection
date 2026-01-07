import { InferSelectModel } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import users from "./users";

export const sets = pgTable("sets", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),

  description: varchar("description", { length: 1024 }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type SelectSet = InferSelectModel<typeof sets>;
