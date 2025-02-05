"use client";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "@/hooks/use-toast";

import { useEffect, useState } from "react";

interface Game {
  id: number;
  name: string;
  // ... other game properties
}

const AddGameForm = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handleGameFound = async (gameInfo: { barcode: string }) => {
    try {
      const response = await fetch(
        `/api/search-games?barcode=${gameInfo.barcode}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch game details");
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      if (data.games && data.games.length > 0) {
        // If multiple games are found, show them as search results
        setSearchResults(data.games);
        setSearchTerm(data.games[0].name); // Set the search term to the first game's name
      } else {
        throw new Error("No games found for this barcode");
      }
    } catch (error) {
      console.error("Error fetching game details:", error);
      toast({
        title: "Error",
        description:
          "Failed to fetch game details. Please try again or search manually.",
        variant: "destructive",
      });
    }
  };

  const fetchGames = async (term: string, isBarcode = false) => {
    try {
      const response = await fetch(
        `/api/search-games?${isBarcode ? "barcode" : "term"}=${encodeURIComponent(term)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch games");
      }
      const data = await response.json();
      setSearchResults(data.games || []);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast({
        title: "Error",
        description: "Failed to fetch games. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchGames(debouncedSearchTerm);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  return (
    <form>
      <label htmlFor="game-search">Search for a game:</label>
      <input
        type="text"
        id="game-search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {searchResults.length > 0 && (
        <ul>
          {searchResults.map((game) => (
            <li key={game.id}>{game.name}</li>
          ))}
        </ul>
      )}

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" className="mb-4">
            Scan Game Barcode
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Barcode Scanner</DialogTitle>
          <BarcodeScanner
            onGameFound={(gameInfo) => {
              handleGameFound(gameInfo);
              setSearchTerm(gameInfo.barcode);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* rest of the form */}
    </form>
  );
};

export default AddGameForm;
