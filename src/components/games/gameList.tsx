import { SelectGameEntry } from "@/db/schema/gameEntry";
import GameCard from "./GameCard";

export default function GameListing({ games }: { games: SelectGameEntry[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
