import db from "@/db";
import { env } from "@/env/server";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    adapter: DrizzleAdapter(db),
    providers: [
        GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    redirect_uri: `${env.NEXTAUTH_URL}/api/auth/callback/google`,
                },
            },
        }),
    ],
    pages: {
        signIn: "/",
    },
    secret: env.NEXTAUTH_SECRET,
};
