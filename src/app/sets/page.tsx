import { CreateSetDialog } from "@/components/sets/create-set-dialog";
import { SetCard } from "@/components/sets/set-card";
import { getSets } from "../actions/setsActions";

export default async function SetsPage() {
  const result = await getSets();
  const sets = result.success ? result.data : [];
  console.log("Fetched sets:", sets);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Sets</h1>
          <p className="text-muted-foreground mt-2">
            Organize your game collection into custom sets
          </p>
        </div>
        <CreateSetDialog />
      </div>

      {sets?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <svg
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No sets yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Create your first set to start organizing your game collection
          </p>
          <CreateSetDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-6">
          {sets?.map((set) => <SetCard key={set.id} set={set} />)}
        </div>
      )}
    </div>
  );
}
