"use server";

import db from "@/db";
import { unstable_cacheLife as cacheLife } from "next/cache";

export const getPlatforms = async () => {
    "use cache";
    cacheLife("days");
    try {
        const platformList = await db.query.platforms.findMany();
        return platformList;
    } catch (error) {
        console.error("Error fetching platforms:", error);
        return [];
    }
};