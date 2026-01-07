import { relations } from "drizzle-orm";
import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import gameEntry from "./gameEntry";
import { sets } from "./sets";

export const setGameEntry = pgTable(
  "set_game_entry",
  {
    setId: uuid("set_id")
      .notNull()
      .references(() => sets.id, { onDelete: "cascade" }),

    gameEntryId: uuid("game_entry_id")
      .notNull()
      .references(() => gameEntry.id, { onDelete: "cascade" }),

    addedAt: timestamp("added_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.setId, table.gameEntryId] }),
  })
);

export const setsRelations = relations(sets, ({ many }) => ({
  games: many(setGameEntry),
}));

export const gameEntryRelations = relations(gameEntry, ({ many }) => ({
  sets: many(setGameEntry),
}));

export const setGameEntryRelations = relations(setGameEntry, ({ one }) => ({
  set: one(sets, {
    fields: [setGameEntry.setId],
    references: [sets.id],
  }),
  game: one(gameEntry, {
    fields: [setGameEntry.gameEntryId],
    references: [gameEntry.id],
  }),
}));
