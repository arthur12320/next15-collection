import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getCollections } from "@/lib/queries";
import CreateCollectionForm from "./createCollectionForm";

export default async function TestPage() {
  const collections = await getCollections();
  console.log(collections);
  return (
    <Card className="mx-auto max-w-2xl mt-10">
      <CardContent>
        <h1 className="text-center text-5xl mt-5">Collections</h1>
        {collections?.map((collection) => (
          <div key={collection.id}>{collection.name}</div>
        ))}
      </CardContent>
      <CardFooter>
        <CreateCollectionForm />
      </CardFooter>
    </Card>
  );
}
