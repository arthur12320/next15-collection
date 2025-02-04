"use client";

import { getUserCollections } from "@/app/actions/collectionActions";
import { addGame } from "@/app/actions/gameActions";
import { getPlatforms } from "@/app/actions/platformActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SelectCollection } from "@/db/schema/collections";
import type { SelectPlatform } from "@/db/schema/platforms";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Search } from "lucide-react";
import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { BarcodeScanner } from "./BarcodeScanner";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Game {
  id: string;
  name: string;
  cover_image: string;
  genres: { name: string }[];
}

export default function AddGameForm() {
  const [formResult, formAction] = useActionState(addGame, undefined);
  const [boughtStatus, setBoughtStatus] = useState("wanted");
  const [platforms, setPlatforms] = useState<SelectPlatform[]>([]);
  const [collections, setCollections] = useState<SelectCollection[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Partial<Game>[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    async function fetchPlatforms() {
      const fetchedPlatforms = await getPlatforms();
      setPlatforms(fetchedPlatforms);
    }
    async function fetchUserCollections() {
      const fetchedCollection = await getUserCollections();
      setCollections(fetchedCollection);
    }
    fetchPlatforms();
    fetchUserCollections();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchGames(debouncedSearchTerm);
    } else {
      setSearchResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const fetchGames = async (term: string) => {
    try {
      const response = await fetch(
        `/api/search-games?term=${encodeURIComponent(term)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch games");
      }
      const data = await response.json();
      setSearchResults(data.games);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast({
        title: "Error",
        description: "Failed to fetch games. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchGameDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/search-games?id=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch game details");
      }
      const game = await response.json();
      setSelectedGame(game);
    } catch (error) {
      console.error("Error fetching game details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch game details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGameSelect = async (game: Partial<Game>) => {
    setSearchTerm(game.name || "");
    setSearchResults([]);
    await fetchGameDetails(game.id!);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (!selectedGame) {
      toast({
        title: "Error",
        description: "Please select a game from the search results.",
        variant: "destructive",
      });
      return;
    }

    formData.append("title", selectedGame.name);
    formData.append("imageUrl", selectedGame.cover_image);
    formData.append(
      "genres",
      JSON.stringify(selectedGame.genres.map((g) => g.name))
    );

    await formAction(formData);
    if (formResult?.error) {
      toast({
        title: "Error",
        description: formResult.error.toString(),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Game added to your collection!",
      });
      setSelectedGame(null);
      setSearchTerm("");
      setBoughtStatus("wanted");
      setSelectedPlatform("");
    }
  };

  const handleGameFound = async (gameInfo: { barcode: string }) => {
    try {
      const response = await fetch(
        `/api/search-games?barcode=${gameInfo.barcode}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch game details");
      }
      const game = await response.json();
      if (game.error) {
        throw new Error(game.error);
      }
      setSelectedGame(game);
      setSearchTerm(game.name);
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Add Game to Collection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="mb-4">
              Scan Game Barcode
            </Button>
          </DialogTrigger>
          <DialogTitle>Qr code Scanner</DialogTitle>
          <DialogContent>
            <BarcodeScanner onGameFound={handleGameFound} />
          </DialogContent>
        </Dialog>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="collection" className="text-md font-semibold">
              Collection
            </Label>
            <Select
              name="collection"
              required
              value={selectedCollection}
              onValueChange={setSelectedCollection}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-md font-semibold">
              Game Title
            </Label>
            <div className="relative">
              <Search className="absolute top-2 left-2 " size={20} />
              <Input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a game..."
                className="pl-10"
              />
            </div>
            {searchResults.length > 0 && (
              <ul className="mt-2 border rounded-md shadow-sm max-h-60 overflow-y-auto">
                {searchResults.map((game) => (
                  <li
                    key={game.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleGameSelect(game)}
                  >
                    {game.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedGame && (
            <>
              <div className="space-y-2">
                <Label className="text-md font-semibold">Game Image</Label>
                <Image
                  src={selectedGame.cover_image || "/placeholder.svg"}
                  alt={selectedGame.name}
                  width={200}
                  height={300}
                  className="rounded-md object-cover mx-auto"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-md font-semibold">Genres</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedGame.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="platform" className="text-md font-semibold">
              Platform
            </Label>
            <Select
              name="platform"
              required
              value={selectedPlatform}
              onValueChange={setSelectedPlatform}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="boughtStatus" className="text-md font-semibold">
              Bought Status
            </Label>
            <RadioGroup
              name="boughtStatus"
              value={boughtStatus}
              onValueChange={setBoughtStatus}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="owned" id="owned" />
                <Label htmlFor="owned">Owned</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wanted" id="wanted" />
                <Label htmlFor="wanted">Wanted</Label>
              </div>
            </RadioGroup>
          </div>

          {boughtStatus === "owned" && (
            <div className="space-y-2">
              <Label className="text-md font-semibold" htmlFor="boughtDate">
                Bought Date
              </Label>
              <Input required id="boughtDate" name="boughtDate" type="date" />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!selectedGame}>
            Add Game
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
