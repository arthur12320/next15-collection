import CollectionListing from "@/components/collection/CollectionsListing";
import { Card } from "@/components/ui/card";
import { SelectCollection } from "@/db/schema/collections";
import { getCollections } from "@/lib/queries";

export default async function TestPage() {
  const collections = (await getCollections()) as SelectCollection[];
  return (
    <Card className="mx-auto max-w-2xl mt-10">
      <CollectionListing collections={collections} />
    </Card>
  );
}
