import {
    index,
    pgTable,
    serial,
    text,
    boolean,
    timestamp,
    varchar,
    integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const games = pgTable(
    "games",
    {
        id: serial("id").primaryKey(),
        title: text("title").notNull(),
        platform: text("platform").notNull(),
        image_url: text("image_url"),
    },
);

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;


export const gameEntries = pgTable(
    "gameentries",
    {
        id: serial("id").primaryKey(),
        name: text("name").notNull(),
        game_id: integer("game_id")
            .notNull()
            .references(() => games.id, { onDelete: "cascade" }),
        user_id: integer("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        purchaseDate: timestamp("purchased_at").defaultNow(),
        purchased: boolean("purchased").notNull().default(false)
    },
    (table) => ({
        gameIdx: index("gameentries_game_id_idx").on(
            table.game_id,
        ),
        userIdx: index("gameentries_user_id_idx").on(
            table.user_id,
        ),
    }),
);

export type GameEntry = typeof gameEntries.$inferSelect;
export type NewGameEntry = typeof gameEntries.$inferInsert;

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 100 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ADD RELATIONS

export const gameRelations = relations(games, ({ many }) => ({
    gameEntries: many(gameEntries),
}));

export const gameEntriesRelations = relations(gameEntries, ({ one }) => ({
    game: one(games, {
        fields: [gameEntries.game_id],
        references: [games.id],
    }),
    user: one(users, {
        fields: [gameEntries.user_id],
        references: [users.id],
    }),
}));

export const userRelations = relations(users, ({ many }) => ({
    gameEntries: many(gameEntries),
}));

