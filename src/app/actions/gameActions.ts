"use server";

import db from "@/db";
import { gameEntry } from "@/db/schema";
import { parseWithZod } from "@conform-to/zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "../../../auth";

const addGameSchema = z.object({
  title: z.string().min(1),
  boughtStatus: z.enum(["owned", "wanted"]),
  boughtDate: z.string().optional(),
  platform: z.string(),
  imageUrl: z.string().url(),
  collection: z.string(),
  genres: z.string().transform((str) => JSON.parse(str) as string[]),
});

export async function addGame(prevState: unknown, formData: FormData) {
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
    await db.insert(gameEntry).values({
      userId: session.user.id,
      collectionId: submission.value.collection,
      title: submission.value.title,
      platformId: submission.value.platform,
      imageUrl: submission.value.imageUrl,
      bought: submission.value.boughtStatus === "owned",
      boughtDate:
        submission.value.boughtStatus === "owned" && submission.value.boughtDate
          ? new Date(submission.value.boughtDate)
          : null,
      genre: submission.value.genres,
    });

    revalidatePath("/collections");
    return { success: true };
  } catch (error) {
    console.error("Error adding game:", error);
    return { error: "Failed to add game to collection" };
  }
}

export async function deleteGame(gameId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a game");
  }

  try {
    const result = await db
      .delete(gameEntry)
      .where(eq(gameEntry.id, gameId))
      .returning({ collectionId: gameEntry.collectionId });
    if (result.length > 0) {
      revalidatePath(`/collections/${result[0].collectionId}`);
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting game:", error);
    throw new Error("Failed to delete game from collection");
  }
}

const updateGameSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  boughtStatus: z.enum(["owned", "wanted"]),
  boughtDate: z.string().optional(),
  platform: z.string(),
});

export async function updateGame(prevState: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: updateGameSchema,
  });

  if (submission.status !== "success") {
    return { error: submission.error };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to update a game" };
  }

  try {
    const result = await db
      .update(gameEntry)
      .set({
        title: submission.value.title,
        platformId: submission.value.platform,
        bought: submission.value.boughtStatus === "owned",
        boughtDate:
          submission.value.boughtStatus === "owned" &&
          submission.value.boughtDate
            ? new Date(submission.value.boughtDate)
            : null,
      })
      .where(eq(gameEntry.id, submission.value.id))
      .returning({ collectionId: gameEntry.collectionId });

    if (result.length > 0) {
      revalidatePath(`/collections/${result[0].collectionId}`);
      revalidatePath("/collections");
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating game:", error);
    return { error: "Failed to update game" };
  }
}
