import { getCollections, getPlatforms } from "@/lib/queries";
import RoulettePage from "./RoulettePage";

const Page = async () => {
  const collections = await getCollections();
  const platforms = await getPlatforms();

  return (
    <div className="h-full w-full flex items-center justify-center">
      <RoulettePage collections={collections || []} platforms={platforms} />
    </div>
  );
};

export default Page;
