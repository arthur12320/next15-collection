"use client";
import { deleteGame } from "@/app/actions/gameActions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SelectGameEntry } from "@/db/schema/gameEntry";
import { getGameEntriesByCollection, getPlatforms } from "@/lib/queries";
import { Trash2 } from "lucide-react";

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
  const [status, setStatus] = useState<"all" | "wanted" | "bought">("all");
  const [platforms, setPlatforms] = useState<{ id: string; name: string | null; }[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");


  const pageSize = 12; // Number of items per page

  useEffect(() => {
    fetchData(1, "");
  }, [status, selectedPlatform]);

  useEffect(() => {
    async function fetchPlatforms() {
      const platforms = await getPlatforms();
      setPlatforms(platforms);
    }
    fetchPlatforms();
  }, []);

  const fetchData = async (page: number, query: string) => {
    const result = await getGameEntriesByCollection(id, query, page, pageSize, {
      wanted: status == "wanted",
      bought: status == "bought",
      platform: selectedPlatform !== "all" ? selectedPlatform : undefined
    });
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

  const handleDelete = (gameId: string) => {
    deleteGame(gameId);
    fetchData(currentPage, search);
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
        <div className="flex flex-wrap gap-4 mt-4">
          <Select value={status} onValueChange={e => { setStatus(e); setSearch(""); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="wanted">Wanted</SelectItem>
              <SelectItem value="bought">Bought</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPlatform} onValueChange={e => { setSelectedPlatform(e); setSearch(""); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {platforms.map(platform => (
                <SelectItem key={platform.id} value={platform.id}>{platform.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div >

      {isPending && <p>Loading...</p>
      }
      {
        games && games.length > 0 ? (
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(game.id)}
                        disabled={false}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
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
        )
      }
    </Card >
  );
}
