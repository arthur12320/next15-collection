import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import gameEntry, { SelectGameEntry } from "./gameEntry";
import users, { SelectUser } from "./users";

const collections = pgTable("collection", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    userId: uuid("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const insertCollectionSchema = createInsertSchema(collections).omit({
    id: true,
    userId: true,
    createdAt: true,
});

export const collectionsRelations = relations(collections, ({ one, many }) => ({
    user: one(users, {
        fields: [collections.userId],
        references: [users.id],
    }),
    games: many(gameEntry)
}));

export type SelectCollection = InferSelectModel<typeof collections>;
export type InsertCollection = InferInsertModel<typeof collections>;

export type SelectCollectionWithUser = InferSelectModel<typeof collections> & { user: SelectUser };
export type SelectCollectionWithUserAndGameEntries = InferSelectModel<typeof collections> & { user: SelectUser, games: SelectGameEntry[] };

export default collections;