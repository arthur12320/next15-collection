"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@conform-to/react";

import { insertCollectionSchema } from "@/db/schema/collections";
import { cn } from "@/lib/utils";
import { parseWithZod } from "@conform-to/zod";
import { useActionState } from "react";
import { createCollection } from "./actions";

export default function CreateCollectionForm() {
  const [lastResult, action] = useActionState(createCollection, undefined);
  const [form, fields] = useForm({
    lastResult,
    //Reuse the validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: insertCollectionSchema });
    },
    // Validate the form on blur event triggered
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });
  return (
    <form
      id={form.id}
      onSubmit={form.onSubmit}
      action={action}
      noValidate
      className="mt-4 flex flex-col gap-2 w-full"
    >
      <Textarea
        key={fields.name.key}
        name={fields.name.name}
        placeholder="Collection name"
        className={cn(
          "w-full",
          fields.name.errors && "border-red-500 focus:ring-red-500"
        )}
      />
      {fields.name.errors && (
        <div className="text-red-500 text-sm">{fields.name.errors}</div>
      )}
      {!fields.name.valid && (
        <div className="text-red-500 text-sm">{fields.name.valid}</div>
      )}
      <Button className="w-full">Create new colletion</Button>
    </form>
  );
}
