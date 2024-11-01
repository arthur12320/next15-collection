"use client";
import { createCollection } from "@/app/collections/actions";
import {
  InsertCollection,
  insertCollectionSchema,
  SelectCollectionWithUser,
} from "@/db/schema/collections";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useSession } from "next-auth/react";
import { useActionState, useOptimistic } from "react";
import { CardContent, CardFooter } from "../ui/card";
import CreateCollectionForm from "./CreateCollectionForm";
import CollectionCard from "./collectionCard";

export default function CollectionListing({
  collections,
}: {
  collections: SelectCollectionWithUser[];
}) {
  const { data: session } = useSession();
  const [lastResult, action] = useActionState(createCollection, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: insertCollectionSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const [optimisticCollections, addOptimisticCollections] = useOptimistic(
    collections,
    (state, newCollection: InsertCollection) => {
      return [
        ...state,
        {
          id: "000001",
          name: newCollection.name,
          userId: newCollection.userId,
          user: {
            image: session?.user?.image || "",
            name: session?.user?.name || "",
            id: "000001",
            email: session?.user?.email || "",
            emailVerified: null,
          },
          createdAt: new Date(),
        },
      ];
    }
  );
  return (
    <>
      <CardContent>
        <h1 className="text-center text-5xl mt-5">Collections</h1>
        <div className="grid grid-cols-1 gap-4 mt-5 ">
          {optimisticCollections?.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <CreateCollectionForm
          action={async (formData) => {
            const content = {
              name: formData.get("name") as string,
              userId: "000001",
            };
            addOptimisticCollections(content);
            action(formData);
          }}
          form={form}
          fields={fields}
        />
      </CardFooter>
    </>
  );
}
