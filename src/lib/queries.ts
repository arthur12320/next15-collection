"use server";
import db from "@/db";
import { gameEntry } from "@/db/schema";
import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
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

// Define valid order by fields
export type OrderByField = "title" | "boughtDate" | "id";

export const getGameEntriesByCollection = async (
  collectionId: string,
  query: string,
  page = 1,
  pageSize = 12,
  orderBy: OrderByField = "boughtDate",
  orderDirection: "asc" | "desc" = "desc",
  filters: { wanted?: boolean; bought?: boolean; platform?: string }
) => {
  const session = await auth();

  if (!session?.user)
    return {
      games: [],
      collectionName: "",
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
    };

  const searchQuery = `%${query}%`;
  const offset = (page - 1) * pageSize;

  // Validate orderBy field
  const validOrderByFields: OrderByField[] = ["id", "title", "boughtDate"];
  if (!validOrderByFields.includes(orderBy)) {
    orderBy = "title";
  }

  const gamesQuery = db.query.gameEntry.findMany({
    where: (gameEntry, { eq, and, ilike }) =>
      and(
        eq(gameEntry.collectionId, collectionId),
        eq(gameEntry.userId, session.user.id as string),
        ilike(gameEntry.title, searchQuery),
        ...(filters.wanted ? [eq(gameEntry.bought, false)] : []),
        ...(filters.bought ? [eq(gameEntry.bought, true)] : []),
        ...(filters.platform
          ? [eq(gameEntry.platformId, filters.platform)]
          : [])
      ),
    limit: pageSize,
    offset: offset,
    orderBy:
      orderDirection === "desc"
        ? desc(gameEntry[orderBy])
        : asc(gameEntry[orderBy]),
  });

  const totalCountQuery = db
    .select({ count: count() })
    .from(gameEntry)
    .where(
      and(
        eq(gameEntry.collectionId, collectionId),
        eq(gameEntry.userId, session.user.id as string),
        ilike(gameEntry.title, searchQuery),
        ...(filters.wanted ? [eq(gameEntry.bought, false)] : []),
        ...(filters.bought ? [eq(gameEntry.bought, true)] : []),
        ...(filters.platform
          ? [eq(gameEntry.platformId, filters.platform)]
          : [])
      )
    );

  const [games, [{ count: totalCount }]] = await Promise.all([
    gamesQuery,
    totalCountQuery,
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    games,
    collectionName: "teste",
    totalCount,
    currentPage: page,
    totalPages,
  };
};
