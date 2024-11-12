"use client";
import { deleteCollection } from "@/app/actions/collectionActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectCollectionWithUser } from "@/db/schema/collections";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";

export default function CollectionCard({
  collection,
}: {
  collection: SelectCollectionWithUser;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  return (
    <Card
      className="w-full "
      onClick={() => router.push(`/collections/${collection.id}`)}
    >
      <CardHeader>
        <div className="flex w-full items-center justify-between">
          <CardTitle className="text-2xl text-center font-bold">
            {collection.name}
          </CardTitle>
          <Button
            variant="destructive"
            size="icon"
            className="relative w-10 h-10"
            onClick={() => {
              setIsDeleting(true);
              deleteCollection(collection.id);
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <X className="w-4 h-4" />
            )}
            <span className="sr-only">
              {isDeleting ? "Deleting..." : "Delete"}
            </span>
          </Button>
        </div>
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
