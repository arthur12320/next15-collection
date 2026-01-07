"use server";

import db from "@/db";
import { setGameEntry } from "@/db/schema";
import { sets } from "@/db/schema/sets";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";

export async function createSet(data: { name: string; description?: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to add a set" };
  }
  try {
    const validated = {
      ...data,
      userId: session.user.id,
    };

    const [newSet] = await db.insert(sets).values(validated).returning();

    revalidatePath("/sets");
    return { success: true, data: newSet };
  } catch (error) {
    console.error("[v0] Error creating set:", error);
    return { success: false, error: "Failed to create set" };
  }
}

export async function deleteSet(setId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to add a set" };
  }
  try {
    await db
      .delete(sets)
      .where(and(eq(sets.id, setId), eq(sets.userId, session.user.id)));
    revalidatePath("/sets");
    return { success: true };
  } catch (error) {
    console.error("[v0] Error deleting set:", error);
    return { success: false, error: "Failed to delete set" };
  }
}

export async function getSets() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to fetch sets" };
  }
  try {
    const userSets = await db.query.sets.findMany({
      where: eq(sets.userId, session.user.id),
      orderBy: [desc(sets.createdAt)],
      with: {
        games: {
          with: {
            game: true,
          },
        },
      },
    });

    return { success: true, data: userSets };
  } catch (error) {
    console.error("[v0] Error fetching sets:", error);
    return { success: false, error: "Failed to fetch sets" };
  }
}

export async function addGameToSet(setId: string, gameEntryId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to add a game to a set" };
  }
  try {
    await db.insert(setGameEntry).values({
      setId,
      gameEntryId,
    });

    revalidatePath("/sets");
    return { success: true };
  } catch (error) {
    console.error("[v0] Error adding game to set:", error);
    return { success: false, error: "Failed to add game to set" };
  }
}

export async function removeGameFromSet(setId: string, gameEntryId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to remove a game from a set" };
  }
  try {
    await db
      .delete(setGameEntry)
      .where(
        and(
          eq(setGameEntry.setId, setId),
          eq(setGameEntry.gameEntryId, gameEntryId)
        )
      );

    revalidatePath("/sets");
    return { success: true };
  } catch (error) {
    console.error("[v0] Error removing game from set:", error);
    return { success: false, error: "Failed to remove game from set" };
  }
}
