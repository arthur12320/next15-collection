"use server";

import { getGamesByCollectionAndPlatform } from "@/lib/queries";

export const getGamesForRoulette = async (
  collectionId: string,
  platformId: string,
  boughtStatus: string
) => {
  return getGamesByCollectionAndPlatform(collectionId, platformId, boughtStatus);
};
