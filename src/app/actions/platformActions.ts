"use server";
import db from "@/db";

export const getPlatforms = async () => {
  try {
    const platformList = await db.query.platforms.findMany();
    return platformList;
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return [];
  }
};
