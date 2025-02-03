import { deleteGame } from "@/app/actions/gameActions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SelectCollectionWithUserAndGameEntries } from "@/db/schema/collections";
import { getCollection } from "@/lib/queries";
import { Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import Image from "next/image";

export default async function CollectionPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const collection = (await getCollection(
    id
  )) as SelectCollectionWithUserAndGameEntries;

  async function handleDeleteGame(gameId: string) {
    "use server";
    await deleteGame(gameId);
    revalidatePath(`/collections/${id}`);
  }

  return (
    <Card className="mx-auto max-w-7xl mt-10 p-6">
      <h1 className="text-center text-5xl mt-5 mb-8">{collection?.name}</h1>
      <p className="text-center text-xl mb-6">
        Number of games: {collection?.games?.length}
      </p>

      {collection?.games && collection.games.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {collection.games.map((game) => (
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
                  <form action={handleDeleteGame.bind(null, game.id)}>
                    <Button
                      type="submit"
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Delete ${game.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
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
