import { Card } from "@/components/ui/card";
import { SelectGameEntry } from "@/db/schema/gameEntry";
import Image from "next/image";
import { useMemo } from "react";

// Hash function to generate a consistent number from a string
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
};

// Function to generate a pastel color based on the hash
const generatePastelColor = (platform: string): string => {
  const hash = hashCode(platform);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 80%)`;
};

const GameCard = ({
  game,
  platforms,
  onClick,
}: {
  game: SelectGameEntry;
  platforms: { id: string; name: string | null }[];
  onClick: () => void;
}) => {
  const platformColor = useMemo(
    () => generatePastelColor(game.platformId),
    [game.platformId]
  );

  return (
    <div onClick={onClick} className="cursor-pointer">
      <Card key={game.id} className="overflow-hidden">
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={game.imageUrl || "/placeholder.svg"}
            alt={game.title || "Game cover"}
            fill
            className={`object-cover ${!game.bought ? "grayscale" : ""}`}
          />
          {game.platformId && (
            <span
              className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: platformColor, color: "#000" }}
            >
              {
                platforms.find((platform) => platform.id == game.platformId)
                  ?.name
              }
            </span>
          )}
        </div>
        <div className="p-4">
          <h2 className="font-semibold text-lg mb-2 truncate">{game.title}</h2>
          <div className="flex justify-between items-center">
            <span
              className={`px-2 py-1 rounded-full text-sm ${
                game.bought
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {game.bought ? "Owned" : "Wanted"}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GameCard;
