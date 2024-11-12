import { InferSelectModel } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import platforms from "./platforms";

const games = pgTable("game", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }),
    platformId: uuid("platformId")
        .notNull()
        .references(() => platforms.id, { onDelete: "cascade" }),
});

export type SelectGame = InferSelectModel<typeof games>;

export default games;