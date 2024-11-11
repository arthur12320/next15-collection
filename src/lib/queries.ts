import db from "@/db";
import { and } from "drizzle-orm";
import { auth } from "../../auth";

export const getCollections = async () => {
    const session = await auth();

    if (!session?.user) return null;
    const collections = await db.query.collections.findMany({
        where: (collections, { eq }) => eq(collections.userId, session?.user?.id as string),
        orderBy: (collections, { asc }) => asc(collections.createdAt),
        with: {
            user: true
        }
    });

    return collections;
};

export const getCollection = async (id: string) => {
    const session = await auth();
    console.log(id[0]);

    if (!session?.user) return null;
    const collections = await db.query.collections.findFirst({
        where: (collections, { eq }) => and(eq(collections.id, id[0]), eq(collections.userId, session?.user?.id as string)),
        orderBy: (collections, { asc }) => asc(collections.createdAt),
        with: {
            user: true,
            games: true
        }
    });

    return collections;
};