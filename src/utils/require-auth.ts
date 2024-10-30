import { authOptions } from "@/app/config/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function requireAuth() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/");
    }
}