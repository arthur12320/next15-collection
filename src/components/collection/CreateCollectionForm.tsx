"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";
import { FieldMetadata, FormMetadata } from "@conform-to/react";

type CreateCollectionFormProps = {
  fields: Required<{
    name: FieldMetadata<
      string,
      {
        name: string;
      },
      string[]
    >;
  }>;
  form: FormMetadata<
    {
      name: string;
    },
    string[]
  >;
  action: (payload: FormData) => void;
};

export default function CreateCollectionForm({
  fields,
  form,
  action,
}: CreateCollectionFormProps) {
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
      <Button type="submit" className="w-full">
        Create new colletion
      </Button>
    </form>
  );
}
