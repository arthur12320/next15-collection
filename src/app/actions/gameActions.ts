"use server";

import db from "@/db";
import { gameEntry, games } from "@/db/schema";
import { parseWithZod } from "@conform-to/zod";
import { put } from "@vercel/blob";
import { like } from "drizzle-orm";
import { eq } from "drizzle-orm/expressions";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "../../../auth";


export async function searchGames(query: string) {
    try {
        const searchResults = await db.select().from(games)
            .where(like(games.title, `%${query}%`))
            .limit(5);
        return searchResults;
    } catch (error) {
        console.error("Error searching games:", error);
        return [];
    }
}

export interface AddGameInput {
    title: string
    boughtStatus: "owned" | "wanted"
    boughtDate?: string
    platform: string
    image: File
    collection: string
}

const addGameSchema = z.object({
    title: z.string().min(1),
    boughtStatus: z.enum(["owned", "wanted"]),
    boughtDate: z.string().optional(),
    platform: z.string(),
    image: z.instanceof(File),
    collection: z.string(),
});

export async function addGame(prevState: unknown, formData: FormData) {
    console.log(formData);
    const submission = parseWithZod(formData, {
        schema: addGameSchema,
    });

    if (submission.status !== "success") {
        console.log(submission.error);
        return { error: submission.error };
    }

    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be logged in to add a game" };
    }

    try {
        // Upload image to Vercel Blob
        const blob = await put(`game-images/${submission.value.image.name}`, submission.value.image, {
            access: "public",
        });

        // Check if the game already exists
        const existingGame = await db.select().from(games).where(eq(games.title, submission.value.title)).limit(1);
        let gameId: string;

        if (existingGame.length === 0) {
            // Create a new game if it doesn't exist
            const [newGame] = await db.insert(games).values({
                title: submission.value.title,
                platformId: submission.value.platform,

            }).returning({ id: games.id });
            gameId = newGame.id;
        } else {
            gameId = existingGame[0].id;
        }

        // Create a new game entry for the user

        await db.insert(gameEntry).values({
            userId: session.user.id,
            collectionId: submission.value.collection,
            gameId: gameId,
            imageUrl: blob.url,
            bought: submission.value.boughtStatus === "owned",
            boughtDate: submission.value.boughtStatus === "owned" && submission.value?.boughtDate ? new Date(submission.value?.boughtDate) : null,
        });


        revalidatePath("/collections");
        return { success: true };
    } catch (error) {
        console.error("Error adding game:", error);
        return { error: "Failed to add game to collection" };
    }
}