import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectCollectionWithUser } from "@/db/schema/collections";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

export default function CollectionCard({
  collection,
}: {
  collection: SelectCollectionWithUser;
}) {
  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle className="text-2xl text-center font-bold">
          {collection.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex w-full items-center space-x-4">
          <Avatar>
            <AvatarImage
              className="h-8 w-8 rounded-full"
              src={collection.user.image}
              alt={collection?.user?.name || "User Avatar"}
            />
            <AvatarFallback>
              {collection?.user?.name
                ? collection?.user?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-none">By</p>
            <p className="text-sm text-muted-foreground">
              {collection.user.name}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
