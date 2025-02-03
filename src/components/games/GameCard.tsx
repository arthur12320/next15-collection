import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectGameEntry } from "@/db/schema/gameEntry";
import { getGame } from "@/lib/queries";
import Image from "next/image";
import { Suspense } from "react";

export default async function GameCard({
  game: gameEntry,
}: {
  game: SelectGameEntry;
}) {
  const game = await getGame(gameEntry.gameId);

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <Suspense fallback={<GameCardSkeleton />}>
        <div className="relative aspect-[2/3] w-full bg-muted">
          <Image
            src={gameEntry.imageUrl}
            alt={game?.title || "Game"}
            fill
            className={`object-contain transition-all duration-300 ${
              !gameEntry.bought ? "grayscale" : ""
            }`}
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{game?.title}</h3>
          {!gameEntry.bought && (
            <span className="text-sm text-muted-foreground">Not purchased</span>
          )}
        </CardContent>
      </Suspense>
    </Card>
  );
}

function GameCardSkeleton() {
  return (
    <>
      <div className="relative aspect-[16/9] w-full">
        <Skeleton className="h-full w-full" />
      </div>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </>
  );
}
