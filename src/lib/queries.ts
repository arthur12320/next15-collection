"use server";
import db from "@/db";
import { and } from "drizzle-orm";
import { auth } from "../../auth";

export const getCollections = async () => {
  const session = await auth();

  if (!session?.user) return null;
  const collections = await db.query.collections.findMany({
    where: (collections, { eq }) =>
      eq(collections.userId, session?.user?.id as string),
    orderBy: (collections, { asc }) => asc(collections.createdAt),
    with: {
      user: true,
    },
  });

  return collections;
};

export const getCollection = async (id: string, query: string) => {
  const session = await auth();

  const searchQuery = `%${query}%`;
  if (!session?.user) return null;
  const collections = await db.query.collections.findFirst({
    where: (collections, { eq }) =>
      and(
        eq(collections.id, id[0]),
        eq(collections.userId, session?.user?.id as string)
      ),
    with: {
      user: true,
      games: {
        where: (game, { ilike }) => ilike(game.title, searchQuery),
        limit: 20,
      },
    },
  });

  return collections;
};

export const getPlatforms = async () => {
  try {
    const platformList = await db.query.platforms.findMany();
    return platformList;
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return [];
  }
};

export const getGame = async (id: string) => {
  const session = await auth();
  if (!session?.user) return null;
  const game = await db.query.games.findFirst({
    where: (games, { eq }) => eq(games.id, id),
  });

  return game;
};

export const getGameEntriesByCollection = async (
  collectionId: string,
  query: string
) => {
  const session = await auth();

  if (!session?.user) return { games: [], collectionName: "" };

  const searchQuery = `%${query}%`;

  const collection = await db.query.collections.findFirst({
    where: (collections, { eq }) =>
      and(
        eq(collections.id, collectionId),
        eq(collections.userId, session.user.id as string)
      ),
    columns: {
      name: true,
    },
  });

  if (!collection) return { games: [], collectionName: "" };

  const games = await db.query.gameEntry.findMany({
    where: (gameEntry, { eq, and, ilike }) =>
      and(
        eq(gameEntry.collectionId, collectionId),
        eq(gameEntry.userId, session.user.id as string),
        ilike(gameEntry.title, searchQuery)
      ),
  });

  return { games, collectionName: collection.name };
};
