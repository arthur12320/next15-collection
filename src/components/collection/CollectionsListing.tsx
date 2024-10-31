"use client";
import { createCollection } from "@/app/collections/actions";
import {
  InsertCollection,
  insertCollectionSchema,
  SelectCollection,
} from "@/db/schema/collections";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useActionState, useOptimistic } from "react";
import { CardContent, CardFooter } from "../ui/card";
import CreateCollectionForm from "./CreateCollectionForm";

export default function CollectionListing({
  collections,
}: {
  collections: SelectCollection[];
}) {
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
          createdAt: new Date(),
        },
      ];
    }
  );
  return (
    <>
      <CardContent>
        <h1 className="text-center text-5xl mt-5">Collections</h1>
        {optimisticCollections?.map((collection) => (
          <div key={collection.id}>{collection.name}</div>
        ))}
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
