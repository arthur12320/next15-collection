import { unstable_cache } from "next/cache";
import { db } from "@/db";

export const getUsers = unstable_cache(
    () =>
        db.query.users.findMany({
            orderBy: (users, { asc }) => asc(users.username),
        }),
    ["users"],
    {
        revalidate: 60 * 60 * 2, // two hours,
    },
);