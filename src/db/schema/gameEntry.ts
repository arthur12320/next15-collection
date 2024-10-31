import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import collections from "./collections";
import games from "./games";
import users from "./users";

const gameEntry = pgTable("game_entry", {
    id: uuid("id").primaryKey().defaultRandom(),
    bought: boolean("bought").notNull(),
    boughtDate: timestamp("bought_date", { mode: "date" }),
    imageUrl: varchar("image_url", { length: 2048 }).notNull(),
    userId: uuid("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    gameId: uuid("gameId")
        .notNull()
        .references(() => games.id, { onDelete: "cascade" }),
    collectionId: uuid("collectionId")
        .notNull()
        .references(() => collections.id, { onDelete: "cascade" }),

});

export default gameEntry;