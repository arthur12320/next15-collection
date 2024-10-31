"use server";

import db from "@/db";
import collections, { insertCollectionSchema } from "@/db/schema/collections";
import { parseWithZod } from "@conform-to/zod";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";

export async function createCollection(prevState: unknown, formData: FormData) {

    const submission = parseWithZod(formData, {
        schema: insertCollectionSchema,
    });

    if (submission.status !== "success") {
        return submission.reply();
    }

    const session = await auth();

    if (!session?.user) {
        return redirect("/");
    }

    await db.insert(collections).values({
        name: submission.value.name,
        userId: session.user.id as string,
    });

    revalidatePath("/collections");
}