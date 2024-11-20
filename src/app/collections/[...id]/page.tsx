import GameListing from "@/components/games/gameList";
import { Card } from "@/components/ui/card";
import { SelectCollectionWithUserAndGameEntries } from "@/db/schema/collections";
import { getCollection } from "@/lib/queries";

export default async function CollectionPage({
  params,
}: {
  params: { id: string };
}) {
  const collection = (await getCollection(
    (await params).id
  )) as SelectCollectionWithUserAndGameEntries;
  return (
    <Card className="mx-auto max-w-6xl mt-10 p-4">
      <h1 className="text-center text-5xl mt-5">{collection?.name}</h1>
      <p>number of games: {collection?.games?.length}</p>
      <GameListing games={collection?.games} />
    </Card>
  );
}
