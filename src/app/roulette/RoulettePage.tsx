"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useEffect, useState } from "react";
import { Wheel } from "react-custom-roulette";

interface RoulettePageProps {
  collections: SelectCollection[];
  platforms: SelectPlatform[];
}

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SelectCollection } from "@/db/schema/collections";
import { SelectGameEntry } from "@/db/schema/gameEntry";
import { SelectPlatform } from "@/db/schema/platforms";
import { DialogTitle } from "@radix-ui/react-dialog";
import Image from "next/image";
import { getGamesForRoulette } from "./actions";

interface RoulettePageProps {
  collections: SelectCollection[];
  platforms: SelectPlatform[];
}

const RoulettePage = ({ collections, platforms }: RoulettePageProps) => {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null
  );
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(
    "all"
  );
  const [selectedBoughtStatus, setSelectedBoughtStatus] = useState<string>("all");
  const [games, setGames] = useState<SelectGameEntry[]>([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (selectedCollection) {
      setLoading(true);
      getGamesForRoulette(
        selectedCollection,
        selectedPlatform ? selectedPlatform : "all",
        selectedBoughtStatus,
      )
        .then((games) => {
          setGames(games);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedCollection, selectedPlatform, selectedBoughtStatus]);

  const handleSpinClick = () => {
    if (games.length > 0) {
      const newPrizeNumber = Math.floor(Math.random() * games.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

  const data =
    games.length > 0
      ? games.map((game) => ({
          option: game?.title?.substring(0, 20),
          image: { uri: game?.imageUrl, sizeMultiplier: 0.2 },
        }))
      : [{ option: "No games found" }];

  const wonGame = games[prizeNumber];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4">
        <Select
          onValueChange={(value) => setSelectedCollection(value)}
          value={selectedCollection || ""}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a collection" />
          </SelectTrigger>
          <SelectContent>
            {collections.map((collection) => (
              <SelectItem key={collection.id} value={collection.id}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) => setSelectedPlatform(value)}
          value={selectedPlatform || "all"}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {platforms.map((platform) => (
              <SelectItem key={platform.id} value={platform.id.toString()}>
                {platform.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) => setSelectedBoughtStatus(value)}
          value={selectedBoughtStatus}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select bought status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Bought</SelectItem>
            <SelectItem value="false">Not Bought</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-8">
        {loading ? (
          <p>Loading games...</p>
        ) : (
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            onStopSpinning={() => {
              setMustSpin(false);
              setShowModal(true);
            }}
            backgroundColors={["#f87171", "#60a5fa", "#34d399", "#fbbf24"]}
            textColors={["#ffffff"]}
          />
        )}
      </div>
      <Button
        onClick={handleSpinClick}
        disabled={games.length === 0 || mustSpin || loading}
      >
        {mustSpin ? "Spinning..." : "Spin the wheel"}
      </Button>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogTitle>{"That's it!"}</DialogTitle>
          {wonGame && (
            <div>
              <h2 className="text-2xl font-bold">{wonGame.title}</h2>
              <div className="flex justify-center mt-4">
                <Image
                  src={wonGame.imageUrl || "/placeholder.png"}
                  alt={wonGame?.title || "Game Image"}
                  width={200}
                  height={300}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoulettePage;
