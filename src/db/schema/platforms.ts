import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

const platforms = pgTable("platform", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }),
});

export default platforms;