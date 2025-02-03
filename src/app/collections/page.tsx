import CollectionListing from "@/components/collection/CollectionsListing";
import { Card } from "@/components/ui/card";
import { SelectCollectionWithUser } from "@/db/schema/collections";
import { getCollections } from "@/lib/queries";
import { auth } from "../../../auth";

export default async function TestPage() {
  const session = await auth();
  const collections = (await getCollections()) as SelectCollectionWithUser[];
  return (
    <Card className="mx-auto max-w-2xl mt-10">
      <CollectionListing collections={collections} user={session?.user} />
    </Card>
  );
}
