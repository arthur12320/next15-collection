"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SelectGameEntry } from "@/db/schema/gameEntry";
import { getGameEntriesByCollection } from "@/lib/queries";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function CollectionPage() {
  const params = useParams();
  const id = params.id as string;

  const [search, setSearch] = useState<string>("");
  const [games, setGames] = useState<SelectGameEntry[]>([]);
  const [collectionName, setCollectionName] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchInitialData() {
      const initialData = await getGameEntriesByCollection(id[0], "");
      setGames(initialData.games);
      setCollectionName(initialData.collectionName);
    }

    fetchInitialData();
  }, [id]);

  const handleSearch = (value: string) => {
    setSearch(value);

    startTransition(async () => {
      const result = await getGameEntriesByCollection(id[0], value);
      setGames(result.games);
    });
  };

  return (
    <Card className="mx-auto max-w-7xl mt-10 p-6">
      <h1 className="text-center text-5xl mt-5 mb-8">{collectionName}</h1>
      <p className="text-center text-xl mb-6">
        Number of games: {games.length}
      </p>
      <div className="space-y-4">
        <Input
          type="search"
          placeholder="Search games..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full"
        />
      </div>

      {isPending && <p>Loading...</p>}
      {games && games.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <Card key={game.id} className="overflow-hidden">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={game.imageUrl || "/placeholder.svg"}
                  alt={game.title || "Game cover"}
                  fill
                  className={`object-cover ${!game.bought ? "grayscale" : ""}`}
                />
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg mb-2 truncate">
                  {game.title}
                </h2>
                <div className="flex justify-between items-center">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${game.bought ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                  >
                    {game.bought ? "Owned" : "Wanted"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No games in this collection yet.
        </p>
      )}
    </Card>
  );
}
