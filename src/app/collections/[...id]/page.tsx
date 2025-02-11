"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SelectGameEntry } from "@/db/schema/gameEntry";
import { getGameEntriesByCollection } from "@/lib/queries";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function CollectionPage() {
  const params = useParams();
  const id = params?.id[0] as string;

  const [search, setSearch] = useState<string>("");
  const [games, setGames] = useState<SelectGameEntry[]>([]);
  const [collectionName, setCollectionName] = useState<string>("");
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isPending, startTransition] = useTransition();

  const pageSize = 12; // Number of items per page

  useEffect(() => {
    fetchData(1, "");
  }, []); // Removed unnecessary dependency 'id'

  const fetchData = async (page: number, query: string) => {
    const result = await getGameEntriesByCollection(id, query, page, pageSize);
    setGames(result.games);
    setCollectionName(result.collectionName);
    setTotalCount(result.totalCount);
    setCurrentPage(result.currentPage);
    setTotalPages(result.totalPages);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    startTransition(() => fetchData(1, value));
  };

  const handlePageChange = (newPage: number) => {
    startTransition(() => fetchData(newPage, search));
  };

  return (
    <Card className="mx-auto max-w-7xl mt-10 p-6">
      <h1 className="text-center text-5xl mt-5 mb-8">{collectionName}</h1>
      <p className="text-center text-xl mb-6">Total games: {totalCount}</p>
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
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
          <div className="flex justify-between items-center mt-6">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">
          No games in this collection yet.
        </p>
      )}
    </Card>
  );
}
