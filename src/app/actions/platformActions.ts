"use server";
import db from "@/db";
import { cacheLife } from "next/dist/server/use-cache/cache-life";

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