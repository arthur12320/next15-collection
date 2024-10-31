import db from "@/db";
import { auth } from "../../auth";

export const getCollections = async () => {
    const session = await auth();

    if (!session?.user) return null;
    const collections = await db.query.collections.findMany({
        where: (collections, { eq }) => eq(collections.userId, session?.user?.id as string),
        orderBy: (collections, { asc }) => asc(collections.name),
    });

    return collections;
};
