"use client";
import { addGame, searchGames } from "@/app/actions/gameActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectGame } from "@/db/schema/games";
import { SelectPlatform } from "@/db/schema/platforms";
import debounce from "lodash/debounce";

import { getUserCollections } from "@/app/actions/collectionActions";
import { getPlatforms } from "@/app/actions/platformActions";
import { SelectCollection } from "@/db/schema/collections";
import { useToast } from "@/hooks/use-toast";
import { useCombobox } from "downshift";
import { Search, Upload, X } from "lucide-react";
import Image from "next/image";
import { useActionState, useCallback, useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function AddGameForm() {
  // const [state, formAction] = useActionState(addGame, null);
  const [formResult, formAction] = useActionState(addGame, undefined);
  const [boughtStatus, setBoughtStatus] = useState("wanted");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<SelectPlatform[]>([]);
  const [collections, setCollections] = useState<SelectCollection[]>([]);
  const [games, setGames] = useState<SelectGame[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedGame, setSelectedGame] = useState<SelectGame | null>(null);

  const { toast } = useToast();

  const debouncedSearch = useCallback(
    debounce((inputValue: string) => {
      searchGames(inputValue).then(setGames);
    }, 300),
    []
  );

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: games,
    onInputValueChange: ({ inputValue }) => {
      if (!!selectedGame) {
        setSelectedPlatform("");
      }
      setSelectedGame(null);
      if (inputValue?.length > 2) {
        debouncedSearch(inputValue);
      }
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        setSelectedPlatform(selectedItem.platformId);
        setSelectedGame(selectedItem);
      } else {
        setSelectedGame(null);
        setSelectedPlatform("");
      }
    },
    itemToString: (game) => game?.title || "",
  });

  useEffect(() => {
    async function fetchPlatforms() {
      const fetchedPlatforms = await getPlatforms();
      setPlatforms(fetchedPlatforms);
    }
    async function fetchUserCollections() {
      const fetchedColleciton = await getUserCollections();
      setCollections(fetchedColleciton);
    }
    fetchPlatforms();
    fetchUserCollections();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    await formAction(formData);
    if (formResult?.error) {
      toast({
        title: "Error",
        description: formResult?.error.toString(),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Game added to your collection!",
      });
      setImagePreview(null);
      setBoughtStatus("wanted");
      setSelectedPlatform("");
      setSelectedGame(null);
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
                {...getInputProps({
                  name: "title",
                  required: true,
                  className: " rounded-lg pl-10 ",
                })}
              />
              <ul
                {...getMenuProps()}
                className={`${
                  isOpen && games.length > 0 ? "" : "hidden"
                } absolute z-10 w-full bg-white dark:bg-gray-700 mt-1 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm transition-all duration-300 ease-in-out`}
              >
                {isOpen &&
                  games.map((game, index) => (
                    <li
                      key={game.id}
                      {...getItemProps({ item: game, index })}
                      className={`${
                        highlightedIndex === index
                          ? "bg-gray-100 dark:bg-gray-600"
                          : ""
                      } cursor-default select-none relative py-2 pl-3 pr-9 transition-colors duration-200`}
                    >
                      {game.title}
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform" className="text-md font-semibold">
              Platform
            </Label>
            <Select
              name="platform"
              required
              value={selectedPlatform}
              onValueChange={setSelectedPlatform}
              disabled={!!selectedGame}
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

          <div className="space-y-2 transform ">
            <Label htmlFor="image" className="text-md font-semibold">
              Game Image
            </Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="hidden"
            />
            <div className="flex items-center justify-center w-full">
              {imagePreview ? (
                <div className="mt-2 relative">
                  <Image
                    src={imagePreview}
                    alt="Game preview"
                    width={200}
                    height={200}
                    className="rounded-md object-cover mx-auto"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => setImagePreview(null)}
                    aria-label="Delete image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer  dark:hover:bg-bray-800  hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 transition-all"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG or GIF (MAX. 800x400px)
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {boughtStatus === "owned" && (
            <div className="space-y-2">
              <Label className="text-md font-semibold" htmlFor="boughtDate">
                Bought Date
              </Label>
              <Input required id="boughtDate" name="boughtDate" type="date" />
            </div>
          )}

          <Button type="submit" className="w-full">
            Add Game
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
