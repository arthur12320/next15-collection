import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import collections from "./collections";
import platforms from "./platforms";
import users from "./users";

const gameEntry = pgTable("game_entry", {
  id: uuid("id").primaryKey().defaultRandom(),
  bought: boolean("bought").notNull(),
  boughtDate: timestamp("bought_date", { mode: "date" }),
  imageUrl: varchar("image_url", { length: 2048 }).notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }),
  platformId: uuid("platformId")
    .notNull()
    .references(() => platforms.id, { onDelete: "cascade" }),
  collectionId: uuid("collection_id")
    .notNull()
    .references(() => collections.id, { onDelete: "cascade" }),
  genre: varchar("genre").array(),
});

export const gameEntryRelations = relations(gameEntry, ({ one }) => ({
  user: one(users, {
    fields: [gameEntry.userId],
    references: [users.id],
  }),
  collection: one(collections, {
    fields: [gameEntry.collectionId],
    references: [collections.id],
  }),
}));

export type SelectGameEntry = InferSelectModel<typeof gameEntry>;
export type InsertGameEntry = InferInsertModel<typeof gameEntry>;

export default gameEntry;
